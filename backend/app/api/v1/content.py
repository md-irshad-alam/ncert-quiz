from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.db import get_session
from app.api.deps import get_current_user
from app.models.class_ import SchoolClass, SchoolClassResponse
from app.models.subject import Subject, SubjectResponse
from app.models.chapter import Chapter, ChapterResponse
from app.models.flashcard import Flashcard, FlashcardResponse
from app.models.mcq import MCQ, MCQResponse
from app.models.user import User

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
