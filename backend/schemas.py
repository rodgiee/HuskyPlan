from pydantic import BaseModel

class CourseBase(BaseModel):

    # Course fields
    term_desc: str
    session_desc: str
    acad_org_desc: str
    campus: str
    course_id: str
    subject_desc: str
    subject_code: str
    catalog_number: str
    section: str
    component_desc: str
    component_code: str
    min_units: str
    max_units: str
    description: str
    on_monday: bool
    on_tuesday: bool
    on_wednesday: bool
    on_thursday: bool
    on_friday: bool
    on_saturday: bool
    on_sunday: bool
    time_start: str
    time_end: str
    
    instructor_id: int
    instructor_name: str
    instructor_role: str
    
    instruction_mode: str
    facility_desc: str
    enrollment_cap: int
    enrollment_total: int
    waitlist_cap: int
    waitlist_total: int

class Course(CourseBase):
    # Auto incrementing id
    id: int
    
    class Config:
        orm_mode = True