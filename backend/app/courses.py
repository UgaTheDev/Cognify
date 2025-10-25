from fastapi import APIRouter, HTTPException
from typing import List
import json
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
CS_COURSES_FILE = os.path.join(BASE_DIR, "data", "processed", "cs_courses.json")
FR_COURSES_FILE = os.path.join(BASE_DIR, "data", "processed", "fr_courses.json")
DS_COURSES_FILE = os.path.join(BASE_DIR, "data", "processed", "ds_courses.json")

def load_courses():
    """Load courses from both CS, DS and FR JSON files."""
    all_courses = []
    
    # Load CS courses
    try:
        print(f"Loading CS courses from: {CS_COURSES_FILE}")
        with open(CS_COURSES_FILE, 'r') as f:
            cs_data = json.load(f)
            all_courses.extend(cs_data.get('courses', []))
    except FileNotFoundError:
        print(f"WARNING: CS courses file not found at {CS_COURSES_FILE}")
    except Exception as e:
        print(f"ERROR loading CS courses: {e}")
    
    # Load FR courses
    try:
        print(f"Loading FR courses from: {FR_COURSES_FILE}")
        with open(FR_COURSES_FILE, 'r') as f:
            fr_data = json.load(f)
            all_courses.extend(fr_data.get('courses', []))
    except FileNotFoundError:
        print(f"WARNING: FR courses file not found at {FR_COURSES_FILE}")
    except Exception as e:
        print(f"ERROR loading FR courses: {e}")
    
    # Load DS courses
    try:
        print(f"Loading DS courses from: {DS_COURSES_FILE}")
        with open(DS_COURSES_FILE, 'r') as f:
            ds_data = json.load(f)
            all_courses.extend(ds_data.get('courses', []))
    except FileNotFoundError:
        print(f"WARNING: DS courses file not found at {DS_COURSES_FILE}")
    except Exception as e:
        print(f"ERROR loading DS courses: {e}")
    
    print(f"Total courses loaded: {len(all_courses)}")
    return all_courses

@router.get("/")
def get_all_courses():
    """Get all courses from both CS, DS and FR."""
    courses = load_courses()
    return {"courses": courses, "total": len(courses)}

@router.get("/{course_code}")
def get_course_by_code(course_code: str):
    """Get a specific course by code (e.g., 'CS 111' or 'FR 101')."""
    courses = load_courses()
    
    course_code = course_code.upper().replace("-", " ")
    
    for course in courses:
        if course['code'].upper() == course_code:
            return course
    
    raise HTTPException(status_code=404, detail=f"Course {course_code} not found")

@router.get("/search/")
def search_courses(q: str = ""):
    """Search courses by title, code, or description from both CS, DS and FR."""
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
    """Get courses by level (Introductory, Intermediate, Advanced, Graduate) from both CS, DS and FR."""
    courses = load_courses()
    
    results = [
        course for course in courses
        if course['level'].lower() == level.lower()
    ]
    
    return {"courses": results, "total": len(results)}