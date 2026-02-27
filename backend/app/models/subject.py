from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from .class_ import SchoolClass

class SubjectBase(SQLModel):
    name: str

class Subject(SubjectBase, table=True):
    __tablename__ = "subjects"
    id: Optional[int] = Field(default=None, primary_key=True)
    class_id: int = Field(foreign_key="classes.id")
    
    school_class: Optional[SchoolClass] = Relationship(back_populates="subjects")
    chapters: List["Chapter"] = Relationship(back_populates="subject")

class SubjectResponse(SubjectBase):
    id: int
    class_id: int
