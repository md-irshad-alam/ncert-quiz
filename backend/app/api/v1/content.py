from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel
from app.db import get_session
from app.api.deps import get_current_user
from app.models.class_ import SchoolClass, SchoolClassResponse
from app.models.subject import Subject, SubjectResponse
from app.models.chapter import Chapter, ChapterResponse
from app.models.flashcard import Flashcard, FlashcardResponse
from app.models.mcq import MCQ, MCQResponse
from app.models.user import User
from app.models.mcq_attempt import UserMCQAttempt, UserResetLog

router = APIRouter()

@router.get("/classes", response_model=List[SchoolClassResponse])
def get_classes(*, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    classes = session.exec(select(SchoolClass)).all()
    return classes

@router.get("/subjects/{class_id}", response_model=List[SubjectResponse])
def get_subjects(*, session: Session = Depends(get_session), class_id: int, current_user: User = Depends(get_current_user)):
    subjects = session.exec(select(Subject).where(Subject.class_id == class_id)).all()
    return subjects

@router.get("/chapters/{subject_id}", response_model=List[ChapterResponse])
def get_chapters(*, session: Session = Depends(get_session), subject_id: int, current_user: User = Depends(get_current_user)):
    chapters = session.exec(select(Chapter).where(Chapter.subject_id == subject_id)).all()
    return chapters

@router.get("/flashcards/{chapter_id}", response_model=List[FlashcardResponse])
def get_flashcards(*, session: Session = Depends(get_session), chapter_id: int, current_user: User = Depends(get_current_user)):
    flashcards = session.exec(select(Flashcard).where(Flashcard.chapter_id == chapter_id)).all()
    return flashcards

@router.get("/mcqs/{chapter_id}", response_model=List[MCQResponse])
def get_mcqs(*, session: Session = Depends(get_session), chapter_id: int, current_user: User = Depends(get_current_user)):
    mcqs = session.exec(select(MCQ).where(MCQ.chapter_id == chapter_id)).all()
    return mcqs


# ─── MCQ Attempt History ───────────────────────────────────────────────────────

class AttemptCreate(BaseModel):
    chapter_id: int
    mcq_id: int
    selected_answer: str   # A / B / C / D

class AttemptResponse(BaseModel):
    id: int
    mcq_id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct: str
    selected_answer: str
    is_correct: bool

class ResetStatusResponse(BaseModel):
    reset_count: int
    resets_remaining: int

MAX_RESETS = 2

@router.post("/attempts", status_code=201)
def save_attempt(
    *,
    session: Session = Depends(get_session),
    body: AttemptCreate,
    current_user: User = Depends(get_current_user)
):
    """Save a user's answer to an MCQ. Silently skips if already answered."""
    mcq = session.get(MCQ, body.mcq_id)
    if not mcq:
        raise HTTPException(status_code=404, detail="MCQ not found")

    # Skip if already attempted (prevent duplicates)
    existing = session.exec(
        select(UserMCQAttempt)
        .where(UserMCQAttempt.user_id == current_user.id)
        .where(UserMCQAttempt.mcq_id == body.mcq_id)
    ).first()
    if existing:
        return {"message": "already recorded"}

    attempt = UserMCQAttempt(
        user_id=current_user.id,
        chapter_id=body.chapter_id,
        mcq_id=body.mcq_id,
        selected_answer=body.selected_answer.upper(),
        is_correct=body.selected_answer.upper() == mcq.correct.upper()
    )
    session.add(attempt)
    session.commit()
    return {"message": "saved"}


@router.get("/attempts/{chapter_id}", response_model=List[AttemptResponse])
def get_attempts(
    *,
    session: Session = Depends(get_session),
    chapter_id: int,
    current_user: User = Depends(get_current_user)
):
    """Fetch all previously answered questions for a chapter."""
    attempts = session.exec(
        select(UserMCQAttempt)
        .where(UserMCQAttempt.user_id == current_user.id)
        .where(UserMCQAttempt.chapter_id == chapter_id)
    ).all()

    result = []
    for a in attempts:
        mcq = session.get(MCQ, a.mcq_id)
        if mcq:
            result.append(AttemptResponse(
                id=a.id,
                mcq_id=a.mcq_id,
                question=mcq.question,
                option_a=mcq.option_a,
                option_b=mcq.option_b,
                option_c=mcq.option_c,
                option_d=mcq.option_d,
                correct=mcq.correct,
                selected_answer=a.selected_answer,
                is_correct=a.is_correct,
            ))
    return result


@router.get("/attempts/{chapter_id}/reset-status", response_model=ResetStatusResponse)
def get_reset_status(
    *,
    session: Session = Depends(get_session),
    chapter_id: int,
    current_user: User = Depends(get_current_user)
):
    log = session.exec(
        select(UserResetLog)
        .where(UserResetLog.user_id == current_user.id)
        .where(UserResetLog.chapter_id == chapter_id)
    ).first()
    count = log.reset_count if log else 0
    return ResetStatusResponse(reset_count=count, resets_remaining=MAX_RESETS - count)


@router.delete("/attempts/{chapter_id}/reset")
def reset_attempts(
    *,
    session: Session = Depends(get_session),
    chapter_id: int,
    current_user: User = Depends(get_current_user)
):
    """Clear all answers for this chapter. Allowed max 2 times."""
    # Check / create reset log
    log = session.exec(
        select(UserResetLog)
        .where(UserResetLog.user_id == current_user.id)
        .where(UserResetLog.chapter_id == chapter_id)
    ).first()

    if log and log.reset_count >= MAX_RESETS:
        raise HTTPException(
            status_code=403,
            detail=f"Reset limit reached. You can only reset {MAX_RESETS} times per chapter."
        )

    # Delete all attempts for this chapter
    attempts = session.exec(
        select(UserMCQAttempt)
        .where(UserMCQAttempt.user_id == current_user.id)
        .where(UserMCQAttempt.chapter_id == chapter_id)
    ).all()
    for a in attempts:
        session.delete(a)

    # Increment reset counter
    if not log:
        log = UserResetLog(user_id=current_user.id, chapter_id=chapter_id, reset_count=1)
        session.add(log)
    else:
        log.reset_count += 1

    session.commit()
    count = log.reset_count
    return {"message": "reset successful", "reset_count": count, "resets_remaining": MAX_RESETS - count}
