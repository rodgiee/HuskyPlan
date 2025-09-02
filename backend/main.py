from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from contextlib import asynccontextmanager
import logging
import requests
import uvicorn
import io 
import pandas as pd
from constants.courses import ClassKeys, CLASS_DATATYPE
import numpy as np

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import crud, models, schemas
from database import SessionLocal, engine

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
            data = pd.read_excel(io.BytesIO(response.content), engine="openpyxl", usecols=list(CLASS_DATATYPE.keys()))
            
            # Clean Data
            data.replace({ClassKeys.CLASSM_MEETING_TIME_START.value, '.'}, np.nan, inplace=True)
            data.replace({ClassKeys.CLASSM_MEETING_TIME_END.value, '.'}, np.nan, inplace=True)
            data.replace({ClassKeys.Define_CLASSM_INSTRUCTOR_EMPLID.value, ' '}, np.nan, inplace=True)
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
            for day in days_of_week:
                data.replace({day.value: 'Y'}, True, inplace=True)
                data.replace({day.value: 'N'}, False, inplace=True)
  
            data[ClassKeys.CLASSM_MEETING_TIME_START.value] = pd.to_datetime(
                data[ClassKeys.CLASSM_MEETING_TIME_START.value], format='%I:%M:%S %p'
            ).dt.time
            data[ClassKeys.CLASSM_MEETING_TIME_END.value] = pd.to_datetime(
                data[ClassKeys.CLASSM_MEETING_TIME_END.value], format='%I:%M:%S %p'
            ).dt.time
            
            
            # Map columns to model field names for db
            column_mapping = {
                ClassKeys.CLASS_TERM_LDESC.value: "term_desc",
                ClassKeys.CLASS_SESSION_LDESC.value: "session_desc",
                ClassKeys.CLASS_ACAD_ORG_LDESC.value: "acad_org_desc",
                ClassKeys.CLASS_CAMPUS_LDESC.value: "campus",
                ClassKeys.CLASS_COURSE_ID.value: "course_id",
                ClassKeys.CLASS_SUBJECT_LDESC.value: "subject_desc",
                ClassKeys.CLASS_SUBJECT_CD.value: "subject_code",
                ClassKeys.CLASS_CATALOG_NBR.value: "catalog_number",
                ClassKeys.CLASS_SECTION.value: "section",
                ClassKeys.CLASS_COMPONENT_LDESC.value: "component_desc",
                ClassKeys.CLASS_COMPONENT_CD.value: "component_code",
                ClassKeys.CASSC_UNITS_MINIMUM.value: "min_units",
                ClassKeys.CASSC_UNITS_MAXIMUM.value: "max_units",
                ClassKeys.CLASS_DESCR.value: "description",
                ClassKeys.CLASSM_MONDAY.value: "on_monday",
                ClassKeys.CLASSM_TUESDAY.value: "on_tuesday",
                ClassKeys.CLASSM_WEDNESDAY.value: "on_wednesday",
                ClassKeys.CLASSM_THURSDAY.value: "on_thursday",
                ClassKeys.CLASSM_FRIDAY.value: "on_friday",
                ClassKeys.CLASSM_SATURDAY.value: "on_saturday",
                ClassKeys.CLASSM_SUNDAY.value: "on_sunday",
                ClassKeys.CLASSM_MEETING_TIME_START.value: "time_start",
                ClassKeys.CLASSM_MEETING_TIME_END.value: "time_end",
                ClassKeys.Define_CLASSM_INSTRUCTOR_EMPLID.value: "instructor_id",
                ClassKeys.Define_CLASSM_INSTRUCTOR_NAME.value: "instructor_name",
                ClassKeys.CLASSM_INSTRUCTOR_ROLE.value: "instructor_role",
                ClassKeys.CLASS_INSTRUCTION_MODE_LDESC.value: "instruction_mode",
                ClassKeys.CLASSM_FACILITY_LDESC.value: "facility_desc",
                ClassKeys.CLASS_ENRL_CAP.value: "enrollment_cap",
                ClassKeys.CLASS_ENRL_TOT.value: "enrollment_total",
                ClassKeys.CLASS_WAIT_CAP.value: "waitlist_cap",
                ClassKeys.CLASS_WAIT_TOT.value: "waitlist_total"
            }
            data.rename(columns=column_mapping, inplace=True)

            # Update db with data
            db = SessionLocal()
            try:
                # Clear existing data
                db.query(models.Course).delete()
                db.commit()
                
                # Insert new data
                for _, row in data.iterrows():
                    course = models.Course(**row.to_dict())
                    db.add(course)
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
trigger = CronTrigger(second='*/20')
scheduler.add_job(fetch_courses, trigger)


@app.get("/")
async def root():
    print('g')
    return { "message" : "Hello World" }

@app.get("/classes/{course_id}")
async def classes(course_id: int, db: Session = Depends(get_db)):
    logger.debug(course_id)
    classes = crud.get_course_by_course_id(db, course_id)
    if classes is None:
        raise HTTPException(status_code=404, detail="Class not found")
    return classes
    
if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port = 8000)
