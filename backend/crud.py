from sqlalchemy.orm import Session, joinedload
from backend.models import Course, Section, SectionProfessor

# Getting course with sections by course id
def get_course_by_subject_and_catalog_number(db: Session, subject: str, catalog_number: str):
    return (
        db.query(Course)
        .options(
            joinedload(Course.sections)
            .joinedload(Section.professors)
            .joinedload(SectionProfessor.professor),
            joinedload(Course.sections)
            .joinedload(Section.meetings)
        )
        .filter((Course.subject_code == subject) & (Course.catalog_number == catalog_number))
        .first()
    )




