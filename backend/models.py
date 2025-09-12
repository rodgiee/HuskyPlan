from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List, Optional

from backend.database import Base


class Course(Base):
    __tablename__ = "courses"
    
    id: Mapped[str] = mapped_column(primary_key=True, unique=True)
    subject_code: Mapped[str] = mapped_column()
    subject_desc: Mapped[Optional[str]] = mapped_column()
    catalog_number: Mapped[str] = mapped_column()
    description: Mapped[Optional[str]] = mapped_column()
    min_credits: Mapped[int] = mapped_column()
    max_credits: Mapped[int] = mapped_column()
    
    sections: Mapped[List["Section"]] = relationship(back_populates="course")


class Section(Base):
    __tablename__ = "sections"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    course_id: Mapped[str] = mapped_column(ForeignKey("courses.id"))
    section_catalog: Mapped[str] = mapped_column()
    instruction_type: Mapped[Optional[str]] = mapped_column()
    enrollment_cap: Mapped[Optional[int]] = mapped_column()
    enrollment_total: Mapped[Optional[int]] = mapped_column()
    waitlist_cap: Mapped[Optional[int]] = mapped_column()
    waitlist_total: Mapped[Optional[int]] = mapped_column()
    
    course: Mapped["Course"] = relationship(back_populates="sections")
    professors: Mapped[List["SectionProfessor"]] = relationship(back_populates="section")
    meetings: Mapped[List["Meeting"]] = relationship(back_populates="section")


class Meeting(Base):
    __tablename__ = "meetings"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))
    days_of_week: Mapped[str] = mapped_column()
    time_start: Mapped[Optional[str]] = mapped_column()
    time_end: Mapped[Optional[str]] = mapped_column()
    location: Mapped[Optional[str]] = mapped_column()
    
    section: Mapped["Section"] = relationship(back_populates="meetings")


class Professor(Base):
    __tablename__ = "professors"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]] = mapped_column()


class SectionProfessor(Base):
    __tablename__ = "section_professors"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    professor_id: Mapped[int] = mapped_column(ForeignKey("professors.id"))
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))
    role: Mapped[Optional[str]] = mapped_column()
    
    section: Mapped["Section"] = relationship(back_populates="professors")
    professor: Mapped["Professor"] = relationship()
