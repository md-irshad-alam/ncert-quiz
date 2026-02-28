from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import json
from google import genai
from google.genai import errors as genai_errors
from app.db import get_session
from app.api.deps import get_current_user
from app.core.config import settings
from app.models.chapter import Chapter
from app.models.subject import Subject
from app.models.class_ import SchoolClass
from app.models.flashcard import Flashcard, FlashcardResponse
from app.models.mcq import MCQ, MCQResponse
from app.models.api_usage import ApiUsage
from datetime import date

router = APIRouter()

# Use the new google-genai SDK with gemini-2.0-flash (free tier supported)
GEMINI_MODEL = "gemini-2.0-flash"

@router.post("/generate-mcq/{chapter_id}", response_model=List[MCQResponse])
def generate_mcqs(*, session: Session = Depends(get_session), chapter_id: int, current_user = Depends(get_current_user)):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured")

    existing_mcqs = session.exec(select(MCQ).where(MCQ.chapter_id == chapter_id)).all()
    if len(existing_mcqs) >= 5:
        return existing_mcqs

    # AI Rate Limiting logic
    today = date.today()
    usage = session.exec(select(ApiUsage).where(ApiUsage.user_id == current_user.id).where(ApiUsage.usage_date == today)).first()
    if usage and usage.request_count >= 5:
        raise HTTPException(status_code=429, detail="You've exceeded today's limit of 5 AI requests. Please try again tomorrow! 🌟")

    # Fetch chapter context
    chapter = session.get(Chapter, chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
        
    subject = session.get(Subject, chapter.subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    school_class = session.get(SchoolClass, subject.class_id)
    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found")

    prompt = f"""
    Generate 5 multiple choice questions for students studying in Indian school system (NCERT/CBSE).
    Class: {school_class.name}
    Subject: {subject.name}
    Chapter: {chapter.title}

    Format the output strictly as a JSON array of objects with the following keys exactly:
    "question": "The question text"
    "option_a": "First option"
    "option_b": "Second option"
    "option_c": "Third option"
    "option_d": "Fourth option"
    "correct": "A" (or "B", "C", "D")

    Only return valid JSON array, no markdown wrappers formatting, no extra text.
    """

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        text_response = response.text.strip()
        
        # Clean up markdown JSON wrapper if the AI still includes it
        if text_response.startswith('```json'):
            text_response = text_response[7:]
        if text_response.startswith('```'):
            text_response = text_response[3:]
        if text_response.endswith('```'):
            text_response = text_response[:-3]
            
        mcq_list = json.loads(text_response.strip())
        
        new_mcqs = []
        for item in mcq_list:
            mcq = MCQ(
                chapter_id=chapter_id,
                question=item.get("question"),
                option_a=item.get("option_a"),
                option_b=item.get("option_b"),
                option_c=item.get("option_c"),
                option_d=item.get("option_d"),
                correct=item.get("correct")
            )
            session.add(mcq)
            new_mcqs.append(mcq)
            
        session.commit()
        
        # Increment Rate Limit Counter
        if not usage:
            usage = ApiUsage(user_id=current_user.id, usage_date=today, request_count=1)
            session.add(usage)
        else:
            usage.request_count += 1
        session.commit()
        
        for mcq in new_mcqs:
            session.refresh(mcq)
            
        return new_mcqs

    except genai_errors.ClientError as e:
        session.rollback()
        if '429' in str(e) or 'RESOURCE_EXHAUSTED' in str(e):
            print(f"Gemini rate limit hit: {e}")
            if existing_mcqs:
                return existing_mcqs
            raise HTTPException(status_code=429, detail="AI daily quota exceeded. Try again tomorrow or use existing questions.")
        print(f"Error generating MCQs: {e}")
        if existing_mcqs:
            return existing_mcqs
        raise HTTPException(status_code=500, detail="Failed to generate MCQs from AI")
    except Exception as e:
        session.rollback()
        print(f"Error generating MCQs: {e}")
        if existing_mcqs:
            return existing_mcqs
        raise HTTPException(status_code=500, detail="Failed to generate MCQs from AI")

@router.post("/generate-flashcard/{chapter_id}", response_model=List[FlashcardResponse])
def generate_flashcards(*, session: Session = Depends(get_session), chapter_id: int, current_user = Depends(get_current_user)):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured")

    existing_fc = session.exec(select(Flashcard).where(Flashcard.chapter_id == chapter_id)).all()
    if len(existing_fc) >= 5:
        return existing_fc

    # AI Rate Limiting logic
    today = date.today()
    usage = session.exec(select(ApiUsage).where(ApiUsage.user_id == current_user.id).where(ApiUsage.usage_date == today)).first()
    if usage and usage.request_count >= 5:
        raise HTTPException(status_code=429, detail="You've exceeded today's limit of 5 AI requests. Please try again tomorrow! 🌟")

    chapter = session.get(Chapter, chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
        
    subject = session.get(Subject, chapter.subject_id)
    school_class = session.get(SchoolClass, subject.class_id)

    prompt = f"""
    Generate 5 educational flashcards for students studying in Indian school system (NCERT/CBSE).
    Class: {school_class.name}
    Subject: {subject.name}
    Chapter: {chapter.title}

    Format the output strictly as a JSON array of objects with the following keys exactly:
    "question": "A concise question or term"
    "answer": "A clear, concise, and accurate answer or definition"

    Only return valid JSON array, no markdown wrappers formatting, no extra text.
    """

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        text_response = response.text.strip()
        
        if text_response.startswith('```json'):
            text_response = text_response[7:]
        if text_response.startswith('```'):
            text_response = text_response[3:]
        if text_response.endswith('```'):
            text_response = text_response[:-3]
            
        fc_list = json.loads(text_response.strip())
        
        new_fcs = []
        for item in fc_list:
            fc = Flashcard(
                chapter_id=chapter_id,
                question=item.get("question", ""),
                answer=item.get("answer", "")
            )
            session.add(fc)
            new_fcs.append(fc)
            
        session.commit()
        
        # Increment Rate Limit Counter
        if not usage:
            usage = ApiUsage(user_id=current_user.id, usage_date=today, request_count=1)
            session.add(usage)
        else:
            usage.request_count += 1
        session.commit()

        for fc in new_fcs:
            session.refresh(fc)
            
        return new_fcs

    except Exception as e:
        session.rollback()
        print(f"Error generating Flashcards: {e}")
        if existing_fc:
            return existing_fc
        raise HTTPException(status_code=500, detail="Failed to generate Flashcards from AI")
