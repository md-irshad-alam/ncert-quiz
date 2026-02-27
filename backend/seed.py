from sqlmodel import Session
from app.db import engine, init_db
from app.models.class_ import SchoolClass
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.models.flashcard import Flashcard
from app.models.mcq import MCQ
from app.models.user import User
from app.core import security
import os

def seed_db():
    print("Initializing Database...")
    init_db()
    
    with Session(engine) as session:
        # Check if already seeded
        if session.query(SchoolClass).first():
            print("Database already seeded.")
            return

        print("Seeding Users...")
        test_user = User(email="test@example.com", password_hash=security.get_password_hash("password123"))
        session.add(test_user)
        session.commit()
        session.refresh(test_user)

        print("Seeding Classes and Subjects...")
        class10 = SchoolClass(name="Class 10")
        session.add(class10)
        session.commit()
        session.refresh(class10)

        maths = Subject(name="Mathematics", class_id=class10.id)
        session.add(maths)
        session.commit()
        session.refresh(maths)

        print("Seeding Chapters...")
        real_numbers = Chapter(title="Real Numbers", subject_id=maths.id)
        session.add(real_numbers)
        session.commit()
        session.refresh(real_numbers)

        print("Seeding Flashcards...")
        fc1 = Flashcard(chapter_id=real_numbers.id, question="What is a rational number?", answer="A number expressed as p/q where q is not 0.")
        fc2 = Flashcard(chapter_id=real_numbers.id, question="What is Euclid's Division Lemma?", answer="a = bq + r, 0 <= r < b")
        session.add(fc1)
        session.add(fc2)

        print("Seeding MCQs...")
        mcq1 = MCQ(
            chapter_id=real_numbers.id,
            question="Which is a rational number?",
            option_a="√2",
            option_b="π",
            option_c="0.333...",
            option_d="√3",
            correct="C"
        )
        mcq2 = MCQ(
            chapter_id=real_numbers.id,
            question="Product of non-zero rational and irrational is:",
            option_a="always rational",
            option_b="always irrational",
            option_c="rational or irrational",
            option_d="one",
            correct="B"
        )
        session.add(mcq1)
        session.add(mcq2)
        
        session.commit()
        print("Database seeding completed! Use test@example.com / password123 to login.")

if __name__ == "__main__":
    seed_db()
