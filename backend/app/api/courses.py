from fastapi import APIRouter, HTTPException
from typing import List
import json
import os

router = APIRouter()

# Correct path to course data
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
COURSES_FILE = os.path.join(BASE_DIR, "data", "processed", "cs_courses.json")

def load_courses():
    """Load courses from JSON file."""
    try:
        print(f"Loading courses from: {COURSES_FILE}")  # Debug
        with open(COURSES_FILE, 'r') as f:
            data = json.load(f)
            return data['courses']
    except FileNotFoundError:
        print(f"ERROR: File not found at {COURSES_FILE}")
        return []
    except Exception as e:
        print(f"ERROR loading courses: {e}")
        return []

@router.get("/")
def get_all_courses():
    """Get all courses."""
    courses = load_courses()
    return {"courses": courses, "total": len(courses)}

@router.get("/{course_code}")
def get_course_by_code(course_code: str):
    """Get a specific course by code (e.g., 'CS 111')."""
    courses = load_courses()
    
    # Normalize the course code
    course_code = course_code.upper().replace("-", " ")
    
    for course in courses:
        if course['code'].upper() == course_code:
            return course
    
    raise HTTPException(status_code=404, detail=f"Course {course_code} not found")

@router.get("/search/")
def search_courses(q: str = ""):
    """Search courses by title, code, or description."""
    courses = load_courses()
    
    if not q:
        return {"courses": courses, "total": len(courses)}
    
    q = q.lower()
    results = [
        course for course in courses
        if q in course['code'].lower() 
        or q in course['title'].lower()
        or q in course['description'].lower()
    ]
    
    return {"courses": results, "total": len(results)}

@router.get("/level/{level}")
def get_courses_by_level(level: str):
    """Get courses by level (Introductory, Intermediate, Advanced, Graduate)."""
    courses = load_courses()
    
    results = [
        course for course in courses
        if course['level'].lower() == level.lower()
    ]
    
    return {"courses": results, "total": len(results)}
