from sqlalchemy.orm import Session
from models import Course

# Testing
def get_course_by_course_id(db: Session, course_id: int):
    return db.query(Course).where(Course.course_id == course_id).first()


