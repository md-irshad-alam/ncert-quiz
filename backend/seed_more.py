from sqlmodel import Session, select
from app.db import engine, init_db
from app.models.class_ import SchoolClass
from app.models.subject import Subject
from app.models.chapter import Chapter

def seed_more_db():
    print("Initiating Database Seeding for more classes...")
    
    with Session(engine) as session:
        # Classes 6 to 12
        class_names = [f"Class {i}" for i in range(6, 13)]
        
        for class_name in class_names:
            # Check if class exists
            school_class = session.exec(select(SchoolClass).where(SchoolClass.name == class_name)).first()
            if not school_class:
                school_class = SchoolClass(name=class_name)
                session.add(school_class)
                session.commit()
                session.refresh(school_class)
                print(f"Added {class_name}")
            else:
                print(f"{class_name} already exists.")
                
            # For 11 and 12, subjects: Physics, Chemistry, Math
            # For others: Math, Science
            if class_name in ["Class 11", "Class 12"]:
                subjects = ["Physics", "Chemistry", "Mathematics"]
            else:
                subjects = ["Mathematics", "Science"]
                
            for subj_name in subjects:
                subject = session.exec(select(Subject).where(Subject.name == subj_name).where(Subject.class_id == school_class.id)).first()
                if not subject:
                    subject = Subject(name=subj_name, class_id=school_class.id)
                    session.add(subject)
                    session.commit()
                    session.refresh(subject)
                    print(f"  Added Subject: {subj_name} to {class_name}")
                
                # Add one dummy chapter so the UI has something
                chap_name = f"Introduction to {subj_name}"
                chapter = session.exec(select(Chapter).where(Chapter.title == chap_name).where(Chapter.subject_id == subject.id)).first()
                if not chapter:
                    chapter = Chapter(title=chap_name, subject_id=subject.id)
                    session.add(chapter)
                    session.commit()
                    print(f"    Added Chapter: {chap_name}")
                    
        print("Database extended seeding completed!")

if __name__ == "__main__":
    seed_more_db()
