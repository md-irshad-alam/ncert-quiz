from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime, timezone


class UserMCQAttempt(SQLModel, table=True):
    """Stores every answer a user gives to an MCQ question."""
    __tablename__ = "user_mcq_attempts"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    chapter_id: int = Field(foreign_key="chapters.id", index=True)
    mcq_id: int = Field(foreign_key="mcqs.id")
    selected_answer: str          # A / B / C / D
    is_correct: bool
    attempted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserResetLog(SQLModel, table=True):
    """Tracks how many times a user has reset their answers for a chapter (max 2)."""
    __tablename__ = "user_reset_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    chapter_id: int = Field(foreign_key="chapters.id", index=True)
    reset_count: int = Field(default=0)
