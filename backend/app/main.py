from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, content, revision, ai
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.db import init_db

limiter = Limiter(key_func=get_remote_address)

# Initialize database
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the NCERT Smart Revision Mobile App",
    version=settings.VERSION,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS setup for mobile app/frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(content.router, prefix=f"{settings.API_V1_STR}", tags=["content"])
app.include_router(revision.router, prefix=f"{settings.API_V1_STR}/revision", tags=["revision"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])

@app.get("/")
def read_root():
    return {"message": "Welcome to NCERT Smart Revision API"}
