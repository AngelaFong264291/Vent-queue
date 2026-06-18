from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import customer, owner

# Create all database tables automatically
Base.metadata.create_all(bind=engine)

# Start the app
app = FastAPI(title="Vent Queue System")

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect routes
app.include_router(customer.router)
app.include_router(owner.router)

# Test endpoint
@app.get("/")
def home():
    return {"message": "Vent Queue API is running"}