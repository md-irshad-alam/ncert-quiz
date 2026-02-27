from datetime import timedelta, datetime, timezone
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from app.db import get_session
from app.models.user import User, UserCreate, UserResponse, OTPVerify
from app.core import security
from app.core.config import settings
from app.schemas.token import Token
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

def send_otp_email(email: str, otp: str):
    """Send OTP verification code via Outlook SMTP."""
    smtp_email = getattr(settings, 'SMTP_EMAIL', None)
    smtp_password = getattr(settings, 'SMTP_PASSWORD', None)
    
    if not smtp_email or not smtp_password:
        print(f"\n{'='*40}\n📧 EMAIL SENT TO: {email}\n🔑 YOUR OTP CODE IS: {otp}\n{'='*40}\n")
        return
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🔐 Your NCERT Revision Login OTP"
        msg["From"] = smtp_email
        msg["To"] = email
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 30px;">
            <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #22c55e; margin: 0; font-size: 28px;">📚 NCERT Revision</h1>
                    <p style="color: #6b7280; margin-top: 8px;">Your One-Time Verification Code</p>
                </div>
                <div style="text-align: center; background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 20px 0;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Your OTP Code is:</p>
                    <h2 style="color: #111827; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: 800;">{otp}</h2>
                </div>
                <p style="color: #6b7280; font-size: 13px; text-align: center;">
                    This code will expire in <strong>5 minutes</strong>.<br/>
                    If you didn't request this, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 11px; text-align: center;">
                    NCERT Smart Revision App • Made with ❤️ for Students
                </p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, "html"))
        
        with smtplib.SMTP("smtp-mail.outlook.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, email, msg.as_string())
        
        print(f"✅ OTP email sent successfully to {email}")
    except Exception as e:
        print(f"❌ Failed to send OTP email: {e}")
        # Don't crash the login flow if email fails — OTP is still stored in DB
        print(f"🔑 Fallback — OTP for {email}: {otp}")

@router.post("/signup", response_model=UserResponse)
def signup(*, session: Session = Depends(get_session), user_in: UserCreate):
    user = session.exec(select(User).where(User.email == user_in.email)).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = User(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, *, session: Session = Depends(get_session), form_data: OAuth2PasswordRequestForm = Depends()):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    user.otp_code = otp_code
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    session.add(user)
    session.commit()
    
    send_otp_email(user.email, otp_code)
    
    return {"requires_otp": True, "user_id": user.id, "message": "OTP sent to your email"}

@router.post("/verify-otp", response_model=Token)
@limiter.limit("5/minute")
def verify_otp(request: Request, *, session: Session = Depends(get_session), data: OTPVerify):
    user = session.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user.otp_code or user.otp_code != data.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    if user.otp_expires_at and user.otp_expires_at.replace(tzinfo=None) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP code has expired")
        
    # Clear OTP
    user.otp_code = None
    user.otp_expires_at = None
    session.add(user)
    session.commit()
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
