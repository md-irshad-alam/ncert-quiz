from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from .chapter import Chapter

class FlashcardBase(SQLModel):
    question: str
    answer: str

class Flashcard(FlashcardBase, table=True):
    __tablename__ = "flashcards"
    id: Optional[int] = Field(default=None, primary_key=True)
    chapter_id: int = Field(foreign_key="chapters.id")
    
    chapter: Optional[Chapter] = Relationship(back_populates="flashcards")

class FlashcardResponse(FlashcardBase):
    id: int
    chapter_id: int
