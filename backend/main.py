from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import courses

app = FastAPI(
    title="BU Course Planner API",
    description="API for BU Course Planning Tool",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])

@app.get("/")
def read_root():
    return {
        "message": "BU Course Planner API", 
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
