from fastapi import APIRouter, HTTPException
from typing import List, Dict

router = APIRouter()

# In-memory course data (will be replaced with database later)
COURSES = [
    {
        "id": "102500",
        "code": "CS 111",
        "subject": "CS",
        "catalog_number": "111",
        "title": "Introduction to Computer Science 1",
        "short_title": "Intro CS 1",
        "description": "First course for CS majors. Python programming.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": [], "recommended": []},
        "hub_requirements": ["QR2", "CI", "CT"],
        "level": "Introductory"
    },
    {
        "id": "102504",
        "code": "CS 112",
        "subject": "CS",
        "catalog_number": "112",
        "title": "Introduction to Computer Science 2",
        "short_title": "Intro CS 2",
        "description": "Data structures and algorithms.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 111"], "recommended": []},
        "hub_requirements": ["QR2", "CI", "CT"],
        "level": "Introductory"
    },
    {
        "id": "102519",
        "code": "CS 210",
        "subject": "CS",
        "catalog_number": "210",
        "title": "Computer Systems",
        "short_title": "Computer Systems",
        "description": "Hardware and software fundamentals of computer systems.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112"], "recommended": []},
        "hub_requirements": ["QR2"],
        "level": "Intermediate"
    },
    {
        "id": "102538",
        "code": "CS 330",
        "subject": "CS",
        "catalog_number": "330",
        "title": "Analysis of Algorithms",
        "short_title": "Algorithms",
        "description": "Algorithm design and analysis.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112", "CS 131", "CS 132"], "recommended": []},
        "hub_requirements": ["QR2", "CT"],
        "level": "Advanced"
    },
    {
        "id": "102654",
        "code": "CS 585",
        "subject": "CS",
        "catalog_number": "585",
        "title": "Image and Video Computing",
        "short_title": "Image/Video",
        "description": "Computer vision and image processing.",
        "credits": 4.0,
        "component": "IND",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    }
]

def get_all_courses():
    """Helper function to get all courses"""
    return COURSES

@router.get("/api/courses/")
async def list_courses():
    """Get all courses"""
    return {"courses": COURSES, "total": len(COURSES)}

@router.get("/api/courses/{course_code}")
async def get_course(course_code: str):
    """Get a specific course by code"""
    course = next((c for c in COURSES if c["code"] == course_code), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.get("/api/courses/search/")
async def search_courses(q: str = ""):
    """Search courses by query"""
    if not q:
        return {"courses": COURSES, "total": len(COURSES)}
    
    query = q.lower()
    results = [
        c for c in COURSES
        if query in c["code"].lower()
        or query in c["title"].lower()
        or query in c["description"].lower()
    ]
    
    return {"courses": results, "total": len(results)}

# AI Advisor endpoint
@router.post("/api/ai-advisor/")
async def ai_career_advisor(request: dict):
    """AI-powered career advisor"""
    from app.ai_advisor import get_career_recommendations
    
    career_goal = request.get("career_goal", "")
    major = request.get("major", "Computer Science")
    
    if not career_goal:
        raise HTTPException(status_code=400, detail="Career goal is required")
    
    courses = get_all_courses()
    recommendations = get_career_recommendations(
        career_goal=career_goal,
        available_courses=courses,
        current_major=major
    )
    
    return recommendations

# Professor endpoints
@router.get("/api/professors/")
async def get_professors(department: str = "Computer Science"):
    """Get all professors in a department"""
    from app.professor_data import get_professors_by_department
    professors = get_professors_by_department(department)
    return {"professors": professors, "total": len(professors)}

@router.get("/api/professors/{professor_name}")
async def get_professor_details(professor_name: str):
    """Get detailed professor information including OpenAlex data"""
    from app.professor_data import get_professor_by_name
    from app.openalex_service import (
        get_author_data,
        get_author_works,
        get_coauthors,
        generate_research_summary
    )
    
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
    from app.professor_data import get_professor_by_name
    from app.openalex_service import (
        get_author_data,
        get_author_works,
        generate_research_summary,
        generate_cold_email
    )
    
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
