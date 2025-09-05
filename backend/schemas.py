from pydantic import BaseModel
from typing import Optional

class CourseBase(BaseModel):
    course_id_uconn: str
    subject_code: str
    subject_desc: Optional[str]
    catalog_number: str
    description: Optional[str]
    min_credits: int
    max_credits: int

class Course(CourseBase):
    id: int

    class Config:
        orm_mode = True

class SectionBase(BaseModel):
    course_id: int
    section_catalog: str
    days_of_week: str
    time_start: str
    time_end: str
    location: Optional[str]
    instruction_type: Optional[str]
    enrollment_cap: Optional[int]
    enrollment_total: Optional[int]
    waitlist_cap: Optional[int]
    waitlist_total: Optional[int]

class Section(SectionBase):
    id: int

    class Config:
        orm_mode = True

class ProfessorBase(BaseModel):
    professor_id_uconn: str
    professor_name: Optional[str]

class Professor(ProfessorBase):
    id: int

    class Config:
        orm_mode = True

class SectionProfessorBase(BaseModel):
    section_id: int
    professor_id: int
    role: Optional[str]

class SectionProfessor(SectionProfessorBase):
    class Config:
        orm_mode = True