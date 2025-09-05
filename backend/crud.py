from sqlalchemy.orm import Session, joinedload
from models import Course, Section, SectionProfessor

# Getting course with sections by course id
def get_course_by_course_id(db: Session, course_id: str):
     return (
        db.query(Course)
        .options(
            joinedload(Course.sections)
            .joinedload(Section.professors)
            .joinedload(SectionProfessor.professor)
        )
        .filter(Course.id == course_id)
        .first()
    )




