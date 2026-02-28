from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "NCERT Smart Revision API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    GEMINI_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    SMTP_EMAIL: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # For local development we'll use sqlite
    DATABASE_URL: str = "sqlite:///./ncert_revision.db"

    class Config:
        env_file = ".env"

settings = Settings()
