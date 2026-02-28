from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.sql.expression import func
from typing import List
from datetime import datetime, timezone
from app.db import get_session
from app.api.deps import get_current_user
from app.models.progress import Progress, ProgressResponse
from app.models.mcq import MCQ, MCQResponse
from pydantic import BaseModel

router = APIRouter()

class ProgressUpdate(BaseModel):
    chapter_id: int
    correct_answers: int
    total_questions: int

@router.post("/progress/update", response_model=ProgressResponse)
def update_progress(*, session: Session = Depends(get_session), data: ProgressUpdate, current_user = Depends(get_current_user)):
    progress = session.exec(select(Progress).where(Progress.user_id == current_user.id, Progress.chapter_id == data.chapter_id)).first()
    
    accuracy = (data.correct_answers / data.total_questions) * 100 if data.total_questions > 0 else 0.0
    
    if not progress:
        progress = Progress(
            user_id=current_user.id,
            chapter_id=data.chapter_id,
            accuracy=accuracy,
            streak=1,
            last_practiced=datetime.now(timezone.utc)
        )
        session.add(progress)
    else:
        # Simplistic streak logic
        progress.accuracy = (progress.accuracy + accuracy) / 2
        progress.streak += 1
        progress.last_practiced = datetime.now(timezone.utc)
        session.add(progress)
        
    session.commit()
    session.refresh(progress)
    return progress

@router.get("/daily", response_model=List[MCQResponse])
def daily_revision(*, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    """Return 10 random MCQs filtered to the user's selected class."""
    from app.models.chapter import Chapter
    from app.models.subject import Subject

    if current_user.class_id:
        # Get all chapter IDs for the user's class
        subjects = session.exec(select(Subject).where(Subject.class_id == current_user.class_id)).all()
        subject_ids = [s.id for s in subjects]
        if subject_ids:
            chapters = session.exec(select(Chapter).where(Chapter.subject_id.in_(subject_ids))).all()
            chapter_ids = [c.id for c in chapters]
            if chapter_ids:
                mcqs = session.exec(
                    select(MCQ)
                    .where(MCQ.chapter_id.in_(chapter_ids))
                    .order_by(func.random())
                    .limit(10)
                ).all()
                if mcqs:
                    return mcqs

    # Fallback: any 10 random MCQs from the DB
    mcqs = session.exec(select(MCQ).order_by(func.random()).limit(10)).all()
    return mcqs

class ProgressStatsResponse(BaseModel):
    accuracy: int
    completed_chapters: int
    total_quizzes: int
    streak: int

@router.get("/progress/stats", response_model=ProgressStatsResponse)
def get_progress_stats(*, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    user_progress = session.exec(select(Progress).where(Progress.user_id == current_user.id)).all()
    
    if not user_progress:
        return ProgressStatsResponse(accuracy=0, completed_chapters=0, total_quizzes=0, streak=0)
        
    avg_accuracy = sum(p.accuracy for p in user_progress) / len(user_progress)
    completed_chapters = len(user_progress)
    total_quizzes = sum(p.streak for p in user_progress) # Mocking total quizzes with sum of streaks for now
    
    # max streak from all progress records
    max_streak = max(p.streak for p in user_progress)
    
    return ProgressStatsResponse(
        accuracy=int(avg_accuracy),
        completed_chapters=completed_chapters,
        total_quizzes=total_quizzes,
        streak=max_streak
    )
