from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import json
import google.generativeai as genai
from app.db import get_session
from app.api.deps import get_current_user
from app.core.config import settings
from app.models.chapter import Chapter
from app.models.subject import Subject
from app.models.class_ import SchoolClass
from app.models.mcq import MCQ, MCQResponse

router = APIRouter()

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

@router.post("/generate-mcq/{chapter_id}", response_model=List[MCQResponse])
def generate_mcqs(*, session: Session = Depends(get_session), chapter_id: int, current_user = Depends(get_current_user)):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured")

    # Check if we already have exactly 5 MCQs for this chapter (or some minimal number)
    existing_mcqs = session.exec(select(MCQ).where(MCQ.chapter_id == chapter_id)).all()
    if len(existing_mcqs) >= 5:
        return existing_mcqs

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
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
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
        
        for mcq in new_mcqs:
            session.refresh(mcq)
            
        return new_mcqs

    except Exception as e:
        session.rollback()
        print(f"Error generating MCQs: {e}")
        # Return existing ones to fallback if any exist, else exception
        if existing_mcqs:
            return existing_mcqs
        raise HTTPException(status_code=500, detail="Failed to generate MCQs from AI")
