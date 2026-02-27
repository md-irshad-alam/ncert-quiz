from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from .subject import Subject

class ChapterBase(SQLModel):
    title: str

class Chapter(ChapterBase, table=True):
    __tablename__ = "chapters"
    id: Optional[int] = Field(default=None, primary_key=True)
    subject_id: int = Field(foreign_key="subjects.id")
    
    subject: Optional[Subject] = Relationship(back_populates="chapters")
    flashcards: List["Flashcard"] = Relationship(back_populates="chapter")
    mcqs: List["MCQ"] = Relationship(back_populates="chapter")

class ChapterResponse(ChapterBase):
    id: int
    subject_id: int
