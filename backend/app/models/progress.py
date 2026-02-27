from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime, timezone
from .user import User
from .chapter import Chapter

class ProgressBase(SQLModel):
    accuracy: float = Field(default=0.0)
    streak: int = Field(default=0)
    last_practiced: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Progress(ProgressBase, table=True):
    __tablename__ = "progress"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    chapter_id: int = Field(foreign_key="chapters.id")
    
    user: Optional[User] = Relationship()
    chapter: Optional[Chapter] = Relationship()

class ProgressResponse(ProgressBase):
    id: int
    user_id: int
    chapter_id: int
