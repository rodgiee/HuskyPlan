from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# using sqllite, so this just creates a local file
SQLALCHEMY_DATABASE_URL = "sqlite:///./husky_plan.db"

# note: check_same_thread only needed for sqllite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()