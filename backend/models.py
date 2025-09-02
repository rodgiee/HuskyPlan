from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Time
from sqlalchemy.orm import relationship

from database import Base


class Course(Base):
    __tablename__ = "courses"
    
    # Auto incrementing id
    id = Column(Integer, primary_key=True)

    # Course fields
    term_desc = Column(String)
    session_desc = Column(String)
    acad_org_desc = Column(String)
    campus = Column(String)
    course_id = Column(String) # id?
    subject_desc = Column(String)
    subject_code = Column(String)
    catalog_number = Column(String)
    section = Column(String)
    component_desc = Column(String)
    component_code = Column(String)
    min_units = Column(Integer)
    max_units = Column(Integer)
    description = Column(String)
    on_monday = Column(Boolean)
    on_tuesday = Column(Boolean)
    on_wednesday = Column(Boolean)
    on_thursday = Column(Boolean)
    on_friday = Column(Boolean)
    on_saturday = Column(Boolean)
    on_sunday = Column(Boolean)
    time_start = Column(Time)
    time_end = Column(Time)
    
    instructor_id = Column(Integer)
    instructor_name = Column(String)
    instructor_role = Column(String)
    
    instruction_mode = Column(String)
    facility_desc = Column(String)
    enrollment_cap = Column(Integer)
    enrollment_total = Column(Integer)
    waitlist_cap = Column(Integer)
    waitlist_total = Column(Integer)

    # items = relationship("Item", back_populates="owner")


