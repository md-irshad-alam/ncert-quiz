from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from .chapter import Chapter

class MCQBase(SQLModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct: str  # e.g., 'A', 'B', 'C', 'D'

class MCQ(MCQBase, table=True):
    __tablename__ = "mcqs"
    id: Optional[int] = Field(default=None, primary_key=True)
    chapter_id: int = Field(foreign_key="chapters.id")
    
    chapter: Optional[Chapter] = Relationship(back_populates="mcqs")

class MCQResponse(MCQBase):
    id: int
    chapter_id: int
