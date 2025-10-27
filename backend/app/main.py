from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router

app = FastAPI(title="BU Course Planner API")

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)

# Try to import and add smart_recommender if it exists
try:
    from app import smart_recommender
    app.include_router(
        smart_recommender.router,
        prefix="/api",
        tags=["Smart Recommendations"]
    )
    print("✅ Smart recommender loaded successfully")
except ImportError as e:
    print(f"⚠️  Smart recommender not found: {e}")
    print("⚠️  Please add smart_recommender.py to backend/app/ directory")
    print("⚠️  AI recommendations will not work until this file is added")

@app.get("/")
async def root():
    return {"message": "BU Course Planner API", "status": "running"}