from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Read your .env file
load_dotenv()

# Get the database URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the connection to PostgreSQL
engine = create_engine(DATABASE_URL)

# Create a session to talk to the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all your models
Base = declarative_base()

# Function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()