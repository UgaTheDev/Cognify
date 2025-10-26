from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Optional
import json
import re
import os
from pathlib import Path
from datetime import datetime
from app.ai_advisor import get_career_recommendations
from app.professor_data import get_professors_by_department, get_professor_by_name
from app.openalex_service import (
    get_author_data,
    get_author_works,
    get_coauthors,
    generate_research_summary,
    generate_cold_email
)

router = APIRouter()

# Load courses from JSON file
def load_courses_from_json():
    """Load courses from the processed JSON file"""
    try:
        # Path to the processed courses JSON file
        json_path = Path(__file__).parent.parent / "processing_csv" / "output" / "all_courses_data.json"
        
        if not json_path.exists():
            # Fallback path
            json_path = Path(__file__).parent.parent / "processing_csv" / "all_courses_data.json"
            if not json_path.exists():
                print("❌ No course data files found. Run the CSV processor first.")
                return []
        
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract all courses from all schools and flatten them
        all_courses = []
        if 'schools' in data:
            for school_name, school_data in data['schools'].items():
                for course in school_data.get('courses', []):
                    # Add school information to each course
                    course_with_school = course.copy()
                    course_with_school['school'] = school_name
                    course_with_school['id'] = f"{school_name}_{course['code'].replace(' ', '_').replace('|', '_')}"
                    all_courses.append(course_with_school)
        
        print(f"✅ Loaded {len(all_courses)} courses from {len(data.get('schools', {}))} schools")
        return all_courses
        
    except Exception as e:
        print(f"❌ Error loading courses from JSON: {e}")
        return []

def get_all_courses():
    """Helper function to get all courses from JSON file"""
    return load_courses_from_json()

# Health endpoints
@router.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@router.get("/api/ai-advisor/health")
async def ai_advisor_health():
    """AI Advisor health check"""
    try:
        import google.generativeai as genai
        from app.config import Config
        
        if not Config.GOOGLE_API_KEY:
            return {
                "status": "unhealthy", 
                "error": "GOOGLE_API_KEY not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        genai.configure(api_key=Config.GOOGLE_API_KEY)
        models = genai.list_models()
        
        return {
            "status": "healthy", 
            "models_available": len(models) > 0,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# AI Advisor endpoint with proper error handling
@router.post("/api/ai-advisor/")
async def ai_career_advisor(request: dict):
    """AI-powered career advisor"""
    career_goal = request.get("career_goal", "")
    major = request.get("major", "Any")
    
    if not career_goal:
        raise HTTPException(status_code=400, detail="Career goal is required")
    
    try:
        courses = get_all_courses()
        print(f"📚 Loaded {len(courses)} courses for career recommendation")
        
        if len(courses) == 0:
            raise HTTPException(status_code=500, detail="No courses available. Please run the CSV processor first.")
        
        recommendations = get_career_recommendations(
            career_goal=career_goal,
            available_courses=courses,
            current_major=major
        )
        
        print(f"🎯 AI recommendations generated: {recommendations.get('error', 'Success')}")
        
        # If there's an error in the recommendations
        if recommendations.get("error"):
            # But we have some fallback data, return it with a warning
            if recommendations.get("recommended_courses"):
                return recommendations
            else:
                raise HTTPException(
                    status_code=500, 
                    detail=recommendations.get("message", "AI service error")
                )
        
        return recommendations
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"❌ Error in ai-advisor endpoint: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )

# Gemini endpoint
@router.post("/api/gemini/")
async def gemini_endpoint(body: dict = Body(...)):
    """Handle requests to the Gemini AI model."""
    from app.ai_advisor import generate_ai_response  # Make sure this function exists in ai_advisor.py
    
    prompt = body.get('prompt')
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    model = body.get('model')
    print(f"/api/gemini/ called; prompt length: {len(prompt)}")
    
    try:
        result = await generate_ai_response(prompt, model)
        return result
    except Exception as e:
        print(f"❌ Error in gemini endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Your professor endpoints (unchanged)
@router.get("/api/professors/")
async def get_professors(department: str = "Computer Science"):
    """Get all professors in a department"""
    professors = get_professors_by_department(department)
    return {"professors": professors, "total": len(professors)}

@router.get("/api/professors/{professor_name}")
async def get_professor_details(professor_name: str):
    """Get detailed professor information including OpenAlex data"""
    professor = get_professor_by_name(professor_name)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")
    
    oaid = professor.get('oaid', '')
    if oaid:
        author_data = get_author_data(oaid)
        works = get_author_works(oaid, limit=10)
        coauthors = get_coauthors(oaid, limit=10)
        
        if author_data:
            research_summary = generate_research_summary(author_data, works)
            
            return {
                "professor": professor,
                "openalex_data": author_data,
                "recent_works": works,
                "coauthors": coauthors,
                "research_summary": research_summary
            }
    
    return {"professor": professor}

@router.post("/api/professors/cold-email")
async def generate_professor_email(request: dict):
    """Generate personalized cold email to professor"""
    professor_name = request.get("professor_name", "")
    student_interests = request.get("student_interests", "")
    course_context = request.get("course_context", "")
    
    professor = get_professor_by_name(professor_name)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")
    
    oaid = professor.get('oaid', '')
    if not oaid:
        raise HTTPException(status_code=400, detail="Professor has no OpenAlex ID")
    
    author_data = get_author_data(oaid)
    works = get_author_works(oaid, limit=10)
    
    if not author_data:
        raise HTTPException(status_code=500, detail="Could not fetch research data")
    
    research_summary = generate_research_summary(author_data, works)
    
    email = generate_cold_email(
        professor_name=professor_name,
        research_summary=research_summary,
        student_interests=student_interests,
        course_context=course_context
    )
    
    return {
        "email": email,
        "professor": professor_name,
        "research_areas": [c.get('display_name') for c in author_data.get('x_concepts', [])[:5]]
    }

# Course endpoints (you'll need these for the frontend)
@router.get("/api/courses/")
async def list_courses():
    """Get all courses"""
    courses = get_all_courses()
    return {"courses": courses, "total": len(courses)}