from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import json
import httpx
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

# OpenRouter API config (OpenAI-compatible)
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "google/gemma-3-4b-it:free"  # Confirmed working free-tier model


def call_openrouter(prompt: str) -> str:
    """Call OpenRouter API and return the text response."""
    if not settings.OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ncertrevision.app",  # Optional: shown in OpenRouter dashboard
        "X-Title": "NCERT Smart Revision",            # Optional: shown in OpenRouter dashboard
    }

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 2048,
    }

    with httpx.Client(timeout=60.0) as client:
        response = client.post(OPENROUTER_BASE_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


def clean_json_response(text: str) -> str:
    """Strip markdown code fences if model wraps response in them."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


@router.post("/generate-mcq/{chapter_id}", response_model=List[MCQResponse])
def generate_mcqs(*, session: Session = Depends(get_session), chapter_id: int, current_user=Depends(get_current_user)):
    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API Key is not configured")

    existing_mcqs = session.exec(select(MCQ).where(MCQ.chapter_id == chapter_id)).all()
    if len(existing_mcqs) >= 5:
        return existing_mcqs

    # AI Rate Limiting logic
    today = date.today()
    usage = session.exec(
        select(ApiUsage)
        .where(ApiUsage.user_id == current_user.id)
        .where(ApiUsage.usage_date == today)
    ).first()
    if usage and usage.request_count >= 10:
        raise HTTPException(
            status_code=429,
            detail="You've exceeded today's AI limit of 10 requests. Please try again tomorrow! 🌟"
        )

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

    prompt = f"""Generate 5 multiple choice questions for Indian school students (NCERT/CBSE).
Class: {school_class.name}
Subject: {subject.name}
Chapter: {chapter.title}

Return ONLY a valid JSON array, no markdown, no extra text. Each object must have exactly these keys:
"question", "option_a", "option_b", "option_c", "option_d", "correct" (value must be "A", "B", "C", or "D")

Example:
[{{"question": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct": "A"}}]"""

    try:
        text_response = call_openrouter(prompt)
        mcq_list = json.loads(clean_json_response(text_response))

        new_mcqs = []
        for item in mcq_list:
            mcq = MCQ(
                chapter_id=chapter_id,
                question=item.get("question", ""),
                option_a=item.get("option_a", ""),
                option_b=item.get("option_b", ""),
                option_c=item.get("option_c", ""),
                option_d=item.get("option_d", ""),
                correct=item.get("correct", "A").upper()
            )
            session.add(mcq)
            new_mcqs.append(mcq)

        session.commit()

        # Increment rate limit counter
        if not usage:
            usage = ApiUsage(user_id=current_user.id, usage_date=today, request_count=1)
            session.add(usage)
        else:
            usage.request_count += 1
        session.commit()

        for mcq in new_mcqs:
            session.refresh(mcq)

        return new_mcqs

    except json.JSONDecodeError as e:
        session.rollback()
        print(f"JSON parse error from AI: {e}")
        if existing_mcqs:
            return existing_mcqs
        raise HTTPException(status_code=500, detail="AI returned invalid JSON. Please try again.")
    except httpx.HTTPStatusError as e:
        session.rollback()
        print(f"OpenRouter HTTP error: {e.response.status_code} - {e.response.text}")
        if existing_mcqs:
            return existing_mcqs
        raise HTTPException(status_code=502, detail=f"AI service error: {e.response.status_code}")
    except Exception as e:
        session.rollback()
        print(f"Error generating MCQs: {e}")
        if existing_mcqs:
            return existing_mcqs
        raise HTTPException(status_code=500, detail="Failed to generate MCQs. Please try again.")


@router.post("/generate-flashcard/{chapter_id}", response_model=List[FlashcardResponse])
def generate_flashcards(*, session: Session = Depends(get_session), chapter_id: int, current_user=Depends(get_current_user)):
    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API Key is not configured")

    existing_fc = session.exec(select(Flashcard).where(Flashcard.chapter_id == chapter_id)).all()
    if len(existing_fc) >= 5:
        return existing_fc

    # AI Rate Limiting logic
    today = date.today()
    usage = session.exec(
        select(ApiUsage)
        .where(ApiUsage.user_id == current_user.id)
        .where(ApiUsage.usage_date == today)
    ).first()
    if usage and usage.request_count >= 10:
        raise HTTPException(
            status_code=429,
            detail="You've exceeded today's AI limit of 10 requests. Please try again tomorrow! 🌟"
        )

    chapter = session.get(Chapter, chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    subject = session.get(Subject, chapter.subject_id)
    school_class = session.get(SchoolClass, subject.class_id)

    prompt = f"""Generate 5 educational flashcards for Indian school students (NCERT/CBSE).
Class: {school_class.name}
Subject: {subject.name}
Chapter: {chapter.title}

Return ONLY a valid JSON array, no markdown, no extra text. Each object must have exactly these keys:
"question" (a concise term or question), "answer" (a clear, short answer or definition)

Example:
[{{"question": "...", "answer": "..."}}]"""

    try:
        text_response = call_openrouter(prompt)
        fc_list = json.loads(clean_json_response(text_response))

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

        # Increment rate limit counter
        if not usage:
            usage = ApiUsage(user_id=current_user.id, usage_date=today, request_count=1)
            session.add(usage)
        else:
            usage.request_count += 1
        session.commit()

        for fc in new_fcs:
            session.refresh(fc)

        return new_fcs

    except json.JSONDecodeError as e:
        session.rollback()
        print(f"JSON parse error from AI: {e}")
        if existing_fc:
            return existing_fc
        raise HTTPException(status_code=500, detail="AI returned invalid JSON. Please try again.")
    except httpx.HTTPStatusError as e:
        session.rollback()
        print(f"OpenRouter HTTP error: {e.response.status_code} - {e.response.text}")
        if existing_fc:
            return existing_fc
        raise HTTPException(status_code=502, detail=f"AI service error: {e.response.status_code}")
    except Exception as e:
        session.rollback()
        print(f"Error generating Flashcards: {e}")
        if existing_fc:
            return existing_fc
        raise HTTPException(status_code=500, detail="Failed to generate Flashcards. Please try again.")
