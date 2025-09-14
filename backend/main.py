from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from contextlib import asynccontextmanager
import logging
import requests
import uvicorn
import io 
import json
import pandas as pd
from backend.constants.courses import ClassKeys
import numpy as np

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import backend.crud as crud, backend.models as models
from backend.database import SessionLocal, engine
from backend.schemas import CourseSchema
import os

# We don't want this feature
pd.set_option('future.no_silent_downcasting', True)

# Bind our engine
models.Base.metadata.create_all(bind=engine)

# We want an independent db connection for each request 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Configure logging
logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.DEBUG)

# Ensures the scheduled job starts on start! and shuts down on exit
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.debug("start scheduler")
    scheduler.start()
    yield
    scheduler.shutdown()

# App setup
app = FastAPI(lifespan = lifespan)

# The cron job for fetching courses
def fetch_courses():
    logger.debug("Fetching courses...")
    
    url = "https://files.registrar.uconn.edu/registrar_public/All_Classes_Table_Format_Fall.xlsx"
    try:
        response = requests.get(url, stream=True)
        
        if response.status_code == 200:
            data = pd.read_excel(io.BytesIO(response.content), engine="openpyxl", usecols=[key.value for key in ClassKeys])
            
            # Clean Data. Some empty fields are "." for some reason
            data.replace({ClassKeys.CLASSM_MEETING_TIME_START.value: '.'}, np.nan, inplace=True)
            data.replace({ClassKeys.CLASSM_MEETING_TIME_END.value: '.'}, np.nan, inplace=True)
            data.replace({ClassKeys.Define_CLASSM_INSTRUCTOR_EMPLID.value: ' '}, np.nan, inplace=True)
            data.replace({ClassKeys.CLASSM_INSTRUCTOR_ROLE.value: '.'}, np.nan, inplace=True)
            data.dropna(inplace=True)
            
            # Only storrs for now :(
            data = data[data[ClassKeys.CLASS_CAMPUS_LDESC.value] == "Storrs"]
            
            days_of_week = [
                ClassKeys.CLASSM_MONDAY,
                ClassKeys.CLASSM_TUESDAY,
                ClassKeys.CLASSM_WEDNESDAY,
                ClassKeys.CLASSM_THURSDAY,
                ClassKeys.CLASSM_FRIDAY,
                ClassKeys.CLASSM_SATURDAY,
                ClassKeys.CLASSM_SUNDAY,
            ]
            
            # Y/N -> True/False
            for day in days_of_week:
                data.replace({day.value: 'Y'}, True, inplace=True)
                data.replace({day.value: 'N'}, False, inplace=True)
  
            data[ClassKeys.CLASSM_MEETING_TIME_START.value] = pd.to_datetime(
                data[ClassKeys.CLASSM_MEETING_TIME_START.value], format='%I:%M:%S %p'
            ).dt.time
            data[ClassKeys.CLASSM_MEETING_TIME_END.value] = pd.to_datetime(
                data[ClassKeys.CLASSM_MEETING_TIME_END.value], format='%I:%M:%S %p'
            ).dt.time
            
            # Normalize and insert data
            db = SessionLocal()
            try:
                # Clear existing data
                db.query(models.SectionProfessor).delete()
                db.query(models.Professor).delete()
                db.query(models.Section).delete()
                db.query(models.Course).delete()
                db.commit()

                # Insert data into db
                for _, row in data.iterrows():
                    # Reuse or create professor
                    professor = db.query(models.Professor).filter_by(
                        id=row[ClassKeys.Define_CLASSM_INSTRUCTOR_EMPLID.value]
                    ).first()
                    if not professor:
                        professor = models.Professor(
                            id=row[ClassKeys.Define_CLASSM_INSTRUCTOR_EMPLID.value],
                            name=row[ClassKeys.Define_CLASSM_INSTRUCTOR_NAME.value],
                        )
                        db.add(professor)
                        db.flush() # note: flush is needed if we need primary keys

                    # Reuse or create course
                    course = db.query(models.Course).filter_by(
                        subject_code=row[ClassKeys.CLASS_SUBJECT_CD.value],
                        catalog_number=row[ClassKeys.CLASS_CATALOG_NBR.value],
                    ).first()
                    if not course:
                        course = models.Course(
                            subject_code=row[ClassKeys.CLASS_SUBJECT_CD.value],
                            subject_desc=row[ClassKeys.CLASS_SUBJECT_LDESC.value],
                            catalog_number=row[ClassKeys.CLASS_CATALOG_NBR.value],
                            description=row[ClassKeys.CLASS_DESCR.value],
                            min_credits=row[ClassKeys.CASSC_UNITS_MINIMUM.value],
                            max_credits=row[ClassKeys.CASSC_UNITS_MAXIMUM.value],
                        )
                        db.add(course)
                        db.flush()

                    # Reuse or create section
                    section = db.query(models.Section).filter_by(
                        id = row[ClassKeys.CLASS_CLASS_NBR.value]
                    ).first()
                    if not section:
                        section = models.Section(
                            id = row[ClassKeys.CLASS_CLASS_NBR.value],
                            course_id=course.id,
                            section_catalog=row[ClassKeys.CLASS_SECTION.value],
                            instruction_type=row[ClassKeys.CLASS_INSTRUCTION_MODE_LDESC.value],
                            enrollment_cap=row[ClassKeys.CLASS_ENRL_CAP.value],
                            enrollment_total=row[ClassKeys.CLASS_ENRL_TOT.value],
                            waitlist_cap=row[ClassKeys.CLASS_WAIT_CAP.value],
                            waitlist_total=row[ClassKeys.CLASS_WAIT_TOT.value],
                        )
                        db.add(section)
                        db.flush()

                    # Link professor to section
                    section_professor = db.query(models.SectionProfessor).filter_by(
                        section_id=section.id,
                        professor_id=professor.id
                    ).first()

                    if not section_professor:
                        section_professor = models.SectionProfessor(
                            section_id=section.id,
                            professor_id=professor.id,
                            role=row[ClassKeys.CLASSM_INSTRUCTOR_ROLE.value]
                        )
                        
                        db.add(section_professor)
                    
                    # Create a meeting time
                    meeting = db.query(models.Meeting).filter_by(
                        section_id=section.id,
                        days_of_week="".join([day.value for day in days_of_week if row[day.value]]),
                        time_start=str(row[ClassKeys.CLASSM_MEETING_TIME_START.value]),
                        time_end=str(row[ClassKeys.CLASSM_MEETING_TIME_END.value]),
                        location=row[ClassKeys.CLASSM_FACILITY_LDESC.value],
                    ).first()
                    if not meeting:
                        meeting = models.Meeting(
                            section_id=section.id,
                            days_of_week="".join([day.value for day in days_of_week if row[day.value]]),
                            time_start=str(row[ClassKeys.CLASSM_MEETING_TIME_START.value]),
                            time_end=str(row[ClassKeys.CLASSM_MEETING_TIME_END.value]),
                            location=row[ClassKeys.CLASSM_FACILITY_LDESC.value],
                        )
                        db.add(meeting)
                        
                    # TODO Add self referential many to many relationship for sections.
                    # This will allow parent child sections where a parent is a lecture and child could be lab/discussion.
                    # TODO also logic for generating these relationships
                    # For each professor that is a PI of a lecture,
                    #   Their lab/discussion sections are those they are a SI in

                db.commit()
            except Exception as db_error:
                db.rollback()
                logger.exception(db_error)
            finally:
                db.close()
            
    except Exception as e:
        logger.exception(e)

# Configure scheduler 
scheduler = BackgroundScheduler()

fetch_courses()
trigger = CronTrigger(second='0')
scheduler.add_job(fetch_courses, trigger)

@app.get("/")
async def root():
    return { "message" : "Husky Plan!" }

@app.get("/classes", response_model=CourseSchema)
async def classes(subject: str, catalog_number: str, db: Session = Depends(get_db)):
    logger.debug(f"Subject: {subject}, Catalog Number: {catalog_number}")
    classes = crud.get_course_by_subject_and_catalog_number(db, subject, catalog_number)
    
    if classes is None:
        raise HTTPException(status_code=404, detail="Class not found")
    return classes

# Generate openapi schema
openapi_schema = app.openapi()
openapi_path = os.path.join(os.path.dirname(__file__), "constants", "openapi.json")
with open(openapi_path, "w") as f:
    json.dump(openapi_schema, f, indent=2)
    
if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port = 8000)
