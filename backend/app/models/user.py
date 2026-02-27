from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone

class UserBase(SQLModel):
    email: str = Field(index=True, unique=True)

class User(UserBase, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    otp_code: Optional[str] = None
    otp_expires_at: Optional[datetime] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

class OTPVerify(SQLModel):
    user_id: int
    otp_code: str
