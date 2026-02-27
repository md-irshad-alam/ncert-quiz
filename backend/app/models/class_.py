from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class SchoolClassBase(SQLModel):
    name: str  # e.g., "Class 10"

class SchoolClass(SchoolClassBase, table=True):
    __tablename__ = "classes"
    id: Optional[int] = Field(default=None, primary_key=True)
    
    subjects: List["Subject"] = Relationship(back_populates="school_class")

class SchoolClassResponse(SchoolClassBase):
    id: int
