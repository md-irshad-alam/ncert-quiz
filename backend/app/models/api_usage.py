from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import date

class ApiUsage(SQLModel, table=True):
    __tablename__ = "api_usages"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    usage_date: date = Field(default_factory=date.today, index=True)
    request_count: int = Field(default=0)
