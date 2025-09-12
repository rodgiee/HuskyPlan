from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from contextlib import asynccontextmanager
import logging
import requests
import uvicorn
import io 
import pandas as pd
from backend.constants.courses import ClassKeys, CLASS_CONVERTERS
import numpy as np

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import backend.crud as crud, backend.models as models
from backend.database import SessionLocal, engine

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
                        id=row[ClassKeys.CLASS_COURSE_ID.value]
                    ).first()
                    if not course:
                        course = models.Course(
                            id=row[ClassKeys.CLASS_COURSE_ID.value],
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
                        course_id=row[ClassKeys.CLASS_COURSE_ID.value],
                        section_catalog=row[ClassKeys.CLASS_SECTION.value]
                    ).first()
                    if not section:
                        section = models.Section(
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

                    # Always insert meeting (a section can have many meetings)
                    meeting = models.Meeting(
                        section_id=section.id,
                        days_of_week="".join([day.value for day in days_of_week if row[day.value]]),
                        time_start=str(row[ClassKeys.CLASSM_MEETING_TIME_START.value]),
                        time_end=str(row[ClassKeys.CLASSM_MEETING_TIME_END.value]),
                        location=row[ClassKeys.CLASSM_FACILITY_LDESC.value],
                    )
                    db.add(meeting)

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
    return { "message" : "Hello World" }

@app.get("/classes/{course_id}")
async def classes(course_id: int, db: Session = Depends(get_db)):
    logger.debug(course_id)
    classes = crud.get_course_by_course_id(db, course_id)
    
    # TODO Serialize response
    if classes is None:
        raise HTTPException(status_code=404, detail="Class not found")
    return classes
    
if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port = 8000)
