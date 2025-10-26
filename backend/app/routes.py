from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict
import json
import re
from app.ai_advisor import generate_ai_response

router = APIRouter()


@router.get("/api/ai/models")
async def list_ai_models():
    """Return available AI models from the configured Google client for debugging."""
    try:
        import google.generativeai as genai
        from app.config import Config

        if not Config.GOOGLE_API_KEY:
            raise HTTPException(status_code=400, detail="GOOGLE_API_KEY not configured on server")

        genai.configure(api_key=Config.GOOGLE_API_KEY)
        models = genai.list_models()
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Complete CS course data based on BU course catalog
COURSES = [
    {
        "id": "102484",
        "code": "CS 101",
        "subject": "CS",
        "catalog_number": "101",
        "title": "Introduction to Computing",
        "short_title": "Introduction to Computing",
        "description": "Introduction to fundamental concepts of computing.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": [], "recommended": []},
        "hub_requirements": ["QR2"],
        "level": "Introductory"
    },
    {
        "id": "102500",
        "code": "CS 111",
        "subject": "CS",
        "catalog_number": "111",
        "title": "Introduction to Computer Science 1",
        "short_title": "Intro Computer Science 1",
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
        "short_title": "Intro Computer Science 2",
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
        "id": "102510",
        "code": "CS 113",
        "subject": "CS",
        "catalog_number": "113",
        "title": "Combinatoric Structures",
        "short_title": "COMBIN STRUCS",
        "description": "Introduction to combinatorial structures and discrete mathematics.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 111"], "recommended": []},
        "hub_requirements": ["QR2"],
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
        "id": "102533",
        "code": "CS 305",
        "subject": "CS",
        "catalog_number": "305",
        "title": "Introduction to Automata Theory and Formal Languages",
        "short_title": "AUTO&FORM LANG",
        "description": "Automata theory, formal languages, and computability.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112", "CS 113"], "recommended": []},
        "hub_requirements": [],
        "level": "Intermediate"
    },
    {
        "id": "102536",
        "code": "CS 320",
        "subject": "CS",
        "catalog_number": "320",
        "title": "Concepts of Programming Languages",
        "short_title": "Concepts Programming Languages",
        "description": "Fundamental concepts underlying programming language design and implementation.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112"], "recommended": []},
        "hub_requirements": [],
        "level": "Intermediate"
    },
    {
        "id": "102538",
        "code": "CS 330",
        "subject": "CS",
        "catalog_number": "330",
        "title": "Introduction to Analysis of Algorithms",
        "short_title": "Analysis of Algorithms",
        "description": "Algorithm design and analysis.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112", "CS 113"], "recommended": []},
        "hub_requirements": ["QR2", "CT"],
        "level": "Advanced"
    },
    {
        "id": "102540",
        "code": "CS 332",
        "subject": "CS",
        "catalog_number": "332",
        "title": "Elements of the Theory of Computation",
        "short_title": "Elements Theory of Computation",
        "description": "Theoretical foundations of computer science.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 330"], "recommended": []},
        "hub_requirements": [],
        "level": "Advanced"
    },
    {
        "id": "102549",
        "code": "CS 402",
        "subject": "CS",
        "catalog_number": "402",
        "title": "Senior Independent Work",
        "short_title": "SR INDEP WORK",
        "description": "Independent research project for seniors.",
        "credits": 4.0,
        "component": "IND",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": [], "recommended": []},
        "hub_requirements": [],
        "level": "Advanced"
    },
    {
        "id": "102551",
        "code": "CS 410",
        "subject": "CS",
        "catalog_number": "410",
        "title": "Advanced Software Systems",
        "short_title": "ADV SOFTWRE SYS",
        "description": "Advanced topics in software engineering and system design.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 210"], "recommended": []},
        "hub_requirements": [],
        "level": "Advanced"
    },
    {
        "id": "102555",
        "code": "CS 420",
        "subject": "CS",
        "catalog_number": "420",
        "title": "Introduction to Parallel Computing",
        "short_title": "INTRO PAR COMP",
        "description": "Parallel algorithms, architectures, and programming.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 210"], "recommended": []},
        "hub_requirements": [],
        "level": "Advanced"
    },
    {
        "id": "102561",
        "code": "CS 450",
        "subject": "CS",
        "catalog_number": "450",
        "title": "Computer Architecture I",
        "short_title": "COMP ARCH 1",
        "description": "Computer organization and architecture fundamentals.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 210"], "recommended": []},
        "hub_requirements": [],
        "level": "Advanced"
    },
    {
        "id": "102572",
        "code": "CS 480",
        "subject": "CS",
        "catalog_number": "480",
        "title": "Introduction to Computer Graphics",
        "short_title": "INTR COMP GRAPH",
        "description": "Fundamentals of computer graphics and visualization.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112"], "recommended": []},
        "hub_requirements": [],
        "level": "Advanced"
    },
    {
        "id": "102574",
        "code": "CS 491",
        "subject": "CS",
        "catalog_number": "491",
        "title": "Directed Study",
        "short_title": "Directed Study",
        "description": "Directed independent study in computer science.",
        "credits": 1.0,
        "component": "IND",
        "repeatable": True,
        "consent_required": False,
        "prerequisites": {"required": [], "recommended": []},
        "hub_requirements": [],
        "level": "Advanced"
    },
    {
        "id": "102576",
        "code": "CS 492",
        "subject": "CS",
        "catalog_number": "492",
        "title": "Directed Study",
        "short_title": "Directed Study",
        "description": "Directed independent study in computer science.",
        "credits": 1.0,
        "component": "IND",
        "repeatable": True,
        "consent_required": False,
        "prerequisites": {"required": [], "recommended": []},
        "hub_requirements": [],
        "level": "Advanced"
    },
    {
        "id": "102586",
        "code": "CS 511",
        "subject": "CS",
        "catalog_number": "511",
        "title": "Formal Methods 1",
        "short_title": "FORML METHODS 1",
        "description": "Formal methods for software verification and validation.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102594",
        "code": "CS 520",
        "subject": "CS",
        "catalog_number": "520",
        "title": "Programming Languages",
        "short_title": "PROG LANGUAGES",
        "description": "Advanced topics in programming language design and implementation.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 320"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102597",
        "code": "CS 525S",
        "subject": "CS",
        "catalog_number": "525S",
        "title": "Compiler Design Theory",
        "short_title": "COMPILER DESIGN",
        "description": "Theory and practice of compiler design.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 320"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102598",
        "code": "CS 525",
        "subject": "CS",
        "catalog_number": "525",
        "title": "Compiler Design Theory",
        "short_title": "Compiler Design Theory",
        "description": "Theory and practice of compiler design.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 320"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102602",
        "code": "CS 530",
        "subject": "CS",
        "catalog_number": "530",
        "title": "Advanced Algorithms",
        "short_title": "ADV ALGORITHMS",
        "description": "Advanced algorithm design and analysis techniques.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 330"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102607",
        "code": "CS 535",
        "subject": "CS",
        "catalog_number": "535",
        "title": "Complexity Theory",
        "short_title": "COMPLEXITY",
        "description": "Computational complexity and intractability.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 330"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102611",
        "code": "CS 538",
        "subject": "CS",
        "catalog_number": "538",
        "title": "Fundamentals of Cryptography",
        "short_title": "CRYPTOGRAPHY",
        "description": "Mathematical foundations and applications of cryptography.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 330"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102615",
        "code": "CS 540",
        "subject": "CS",
        "catalog_number": "540",
        "title": "Artificial Intelligence",
        "short_title": "ARTIFIC INTELL",
        "description": "Fundamental concepts and techniques in artificial intelligence.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102620",
        "code": "CS 545",
        "subject": "CS",
        "catalog_number": "545",
        "title": "Natural Language Processing",
        "short_title": "NAT LANG PROC",
        "description": "Computational approaches to natural language understanding.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102627",
        "code": "CS 550",
        "subject": "CS",
        "catalog_number": "550",
        "title": "Computer Architecture II",
        "short_title": "COMP ARCH 2",
        "description": "Advanced computer architecture topics.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 450"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102632",
        "code": "CS 552",
        "subject": "CS",
        "catalog_number": "552",
        "title": "Introduction to Operating Systems",
        "short_title": "Intro to Operating Systems",
        "description": "Design and implementation of operating systems.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 210"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102637",
        "code": "CS 555",
        "subject": "CS",
        "catalog_number": "555",
        "title": "Computer Networks",
        "short_title": "COMP NETWORKS",
        "description": "Design and analysis of computer networks.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 210"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102643",
        "code": "CS 560",
        "subject": "CS",
        "catalog_number": "560",
        "title": "Introduction to Database Systems",
        "short_title": "INT DATABASE SY",
        "description": "Database design, implementation, and management.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102654",
        "code": "CS 585",
        "subject": "CS",
        "catalog_number": "585",
        "title": "Image and Video Computing",
        "short_title": "IMAGEVIDEO COM",
        "description": "Computer vision and image processing.",
        "credits": 4.0,
        "component": "LEC",
        "repeatable": False,
        "consent_required": False,
        "prerequisites": {"required": ["CS 112"], "recommended": []},
        "hub_requirements": [],
        "level": "Graduate"
    },
    {
        "id": "102656",
        "code": "CS 591",
        "subject": "CS",
        "catalog_number": "591",
        "title": "Topics in Computer Science",
        "short_title": "COMP SCI TOPICS",
        "description": "Advanced topics in computer science (varies by semester).",
        "credits": 0.5,
        "component": "LEC",
        "repeatable": True,
        "consent_required": False,
        "prerequisites": {"required": [], "recommended": []},
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
async def get_professors(department: str = None):
    """Get all professors, optionally filtered by department"""
    from app.professor_data import get_all_professors, get_professors_by_department
    
    if department and department.lower() != "all":
        professors = get_professors_by_department(department)
    else:
        # Return ALL professors from all departments
        professors = get_all_professors()
    
    return {"professors": professors, "total": len(professors)}

@router.post("/api/gemini/")
async def gemini_endpoint(body: dict = Body(...)):
    """Handle requests to the Gemini AI model."""
    prompt = body.get('prompt')
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    model = body.get('model')  # optional
    # Log incoming prompt for debugging (avoid logging sensitive data in production)
    print(f"/api/gemini/ called; model={model}")
    result = await generate_ai_response(prompt, model)

    # `generate_ai_response` returns {'result': text, ...} on success.
    # If the text itself contains JSON (e.g., career recommendation JSON), parse and return it
    text = None
    if isinstance(result, dict):
        text = result.get('result')
    elif isinstance(result, str):
        text = result

    if text:
        # Try to parse JSON blob from the text
        try:
            parsed = json.loads(text)
            # If parsed is a dict and contains career recommendation keys, return it as structured JSON
            if isinstance(parsed, dict):
                return parsed
            # otherwise return as-is
            return {"result": parsed, "model": result.get('model') if isinstance(result, dict) else None}
        except Exception:
            # Not a plain JSON body; try to extract JSON substring
            try:
                m = re.search(r"\{.*\}", text, re.DOTALL)
                if m:
                    parsed = json.loads(m.group())
                    if isinstance(parsed, dict):
                        return parsed
            except Exception:
                pass

    return result

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