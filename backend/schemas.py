from pydantic import BaseModel, BeforeValidator, ConfigDict
from typing import Annotated, List, Optional

class Parent(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class ProfessorSchema(Parent):
    id: int
    name: Optional[str]

class SectionProfessorSchema(Parent):
    # id: int
    role: Optional[str]
    professor: ProfessorSchema

DAYS_MAPPING = {
    "CLASSM_MONDAY": "Monday",
    "CLASSM_TUESDAY": "Tuesday",
    "CLASSM_WEDNESDAY": "Wednesday",
    "CLASSM_THURSDAY": "Thursday",
    "CLASSM_FRIDAY": "Friday",
    "CLASSM_SATURDAY": "Saturday",
    "CLASSM_SUNDAY": "Sunday",
}

# Preproccessing to convert days of week into array
def parse_days(value: str) -> list[str]:
    if not value:
        return []
    return [name for key, name in DAYS_MAPPING.items() if key in value]

class MeetingSchema(Parent):
    # id: int
    # section_id: int
    days_of_week: Annotated[list[str], BeforeValidator(parse_days)]
    time_start: Optional[str]
    time_end: Optional[str]
    location: Optional[str]

class SectionSchema(Parent):
    id: int
    # course_id: int
    section_catalog: str
    instruction_type: Optional[str]
    enrollment_cap: Optional[int]
    enrollment_total: Optional[int]
    waitlist_cap: Optional[int]
    waitlist_total: Optional[int]
    professors: List[SectionProfessorSchema] = []
    meetings: List[MeetingSchema] = []

class CourseSchema(Parent):
    # id: int
    subject_code: str
    subject_desc: Optional[str]
    catalog_number: str
    description: Optional[str]
    min_credits: int
    max_credits: int
    sections: List[SectionSchema] = []