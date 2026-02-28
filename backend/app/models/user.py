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

    # Profile fields
    username: Optional[str] = Field(default=None, index=True)
    phone: Optional[str] = Field(default=None)
    class_id: Optional[int] = Field(default=None, foreign_key="classes.id")
    user_type: Optional[str] = Field(default="student")  # "student" | "parent"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    username: Optional[str] = None
    phone: Optional[str] = None
    class_id: Optional[int] = None
    user_type: Optional[str] = None


class UserProfileUpdate(SQLModel):
    username: Optional[str] = None
    phone: Optional[str] = None
    class_id: Optional[int] = None
    user_type: Optional[str] = None  # "student" | "parent"


class OTPVerify(SQLModel):
    user_id: int
    otp_code: str
