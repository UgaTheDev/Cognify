from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Optional
import json
import re
import os
from pathlib import Path
from app.ai_advisor import generate_ai_response

router = APIRouter()

# Load courses from the new multi-school JSON file
def load_courses_from_json():
    """Load courses from the processed multi-school JSON file"""
    try:
        # Path to the new multi-school JSON file
        json_path = Path(__file__).parent.parent / "processing_csv" / "output" / "all_courses_data.json"
        
        if not json_path.exists():
            # Fallback path
            json_path = Path(__file__).parent.parent / "processing_csv" / "all_courses_data.json"
            if not json_path.exists():
                print("❌ No multi-school course data found. Run the CSV processor first.")
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

def enhance_course_data(course):
    """Add missing fields for API compatibility"""
    enhanced = course.copy()
    
    # Map fields to expected API structure
    enhanced.setdefault('id', course.get('id', ''))
    enhanced.setdefault('code', course.get('code', ''))
    enhanced.setdefault('title', course.get('name', ''))
    enhanced.setdefault('short_title', course.get('name', ''))
    enhanced.setdefault('description', '')  # Not available in new format
    enhanced.setdefault('credits', 4.0)  # Assume 4 credits
    enhanced.setdefault('component', 'LEC')
    enhanced.setdefault('repeatable', False)
    enhanced.setdefault('consent_required', False)
    enhanced.setdefault('prerequisites', {"required": [], "recommended": []})
    
    # Extract HUB requirements from hub_areas
    hub_requirements = list(course.get('hub_areas', {}).keys())
    enhanced['hub_requirements'] = hub_requirements
    
    # Extract department/subject from course code
    code_parts = course.get('code', '').split()
    if len(code_parts) >= 2:
        enhanced['department'] = code_parts[0] if len(code_parts) > 0 else ''
        enhanced['subject'] = code_parts[1] if len(code_parts) > 1 else ''
        enhanced['catalog_number'] = code_parts[2] if len(code_parts) > 2 else ''
    else:
        enhanced['department'] = course.get('school', '')
        enhanced['subject'] = ''
        enhanced['catalog_number'] = ''
    
    enhanced['academic_group'] = course.get('school', '')
    enhanced['academic_org'] = course.get('school', '')
    enhanced['level'] = 'Undergraduate'  # Default level
    
    return enhanced

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

@router.get("/api/courses/")
async def list_courses(school: Optional[str] = None, hub_area: Optional[str] = None):
    """Get all courses from JSON file with optional school and HUB filtering"""
    courses = get_all_courses()
    
    # Apply filters
    filtered_courses = courses
    if school:
        filtered_courses = [c for c in filtered_courses if c.get('school', '').lower() == school.lower()]
    
    if hub_area:
        filtered_courses = [c for c in filtered_courses if hub_area in c.get('hub_areas', {})]
    
    enhanced_courses = [enhance_course_data(course) for course in filtered_courses]
    return {
        "courses": enhanced_courses, 
        "total": len(enhanced_courses),
        "filters": {
            "school": school,
            "hub_area": hub_area
        }
    }

@router.get("/api/courses/{course_id}")
async def get_course(course_id: str):
    """Get a specific course by ID"""
    courses = get_all_courses()
    
    # Try exact ID match first
    course = next((c for c in courses if c.get("id") == course_id), None)
    
    if not course:
        # Try code match
        course = next((c for c in courses if c.get("code") == course_id), None)
    
    if not course:
        # Try partial code match
        course = next((c for c in courses if course_id in c.get("code", "")), None)
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return enhance_course_data(course)

@router.get("/api/courses/search/")
async def search_courses(
    q: str = "", 
    department: str = None, 
    level: str = None,
    school: str = None,
    hub_area: str = None
):
    """Search courses by query with optional filters"""
    courses = get_all_courses()
    
    query = q.lower() if q else ""
    results = []
    
    for course in courses:
        # Text search
        text_match = True
        if query:
            text_match = (
                query in course.get("code", "").lower() or
                query in course.get("name", "").lower() or
                query in course.get("school", "").lower()
            )
        
        # Department filter
        dept_match = True
        if department:
            dept_match = (
                department.lower() in course.get("code", "").lower() or
                department.lower() in course.get("school", "").lower()
            )
        
        # Level filter (not really available, but we can infer from course code)
        level_match = True
        if level:
            # Try to infer level from course code (e.g., 100-400 level = undergraduate)
            code_parts = course.get("code", "").split()
            catalog_num = code_parts[-1] if code_parts else ""
            if level.lower() == "undergraduate" and any(catalog_num.startswith(str(x)) for x in ['1', '2', '3', '4']):
                level_match = True
            elif level.lower() == "graduate" and any(catalog_num.startswith(str(x)) for x in ['5', '6', '7', '8', '9']):
                level_match = True
            else:
                level_match = False
        
        # School filter
        school_match = True
        if school:
            school_match = school.lower() == course.get("school", "").lower()
        
        # HUB area filter
        hub_match = True
        if hub_area:
            hub_match = hub_area in course.get('hub_areas', {})
        
        if text_match and dept_match and level_match and school_match and hub_match:
            results.append(enhance_course_data(course))
    
    return {"courses": results, "total": len(results)}

@router.get("/api/schools/")
async def list_schools():
    """Get all unique schools"""
    courses = get_all_courses()
    schools = set()
    
    for course in courses:
        school = course.get('school')
        if school:
            schools.add(school)
    
    return {"schools": sorted(list(schools))}

@router.get("/api/departments/")
async def list_departments():
    """Get all unique departments (extracted from course codes)"""
    courses = get_all_courses()
    departments = set()
    
    for course in courses:
        code = course.get('code', '')
        if ' ' in code:
            dept = code.split()[0]
            if dept:
                departments.add(dept)
    
    return {"departments": sorted(list(departments))}

@router.get("/api/hub-areas/")
async def list_hub_areas():
    """Get all unique HUB areas across all courses"""
    courses = get_all_courses()
    hub_areas = set()
    
    for course in courses:
        for hub_area in course.get('hub_areas', {}).keys():
            hub_areas.add(hub_area)
    
    return {"hub_areas": sorted(list(hub_areas))}

@router.get("/api/subjects/")
async def list_subjects():
    """Get all unique subjects"""
    courses = get_all_courses()
    subjects = set()
    
    for course in courses:
        code = course.get('code', '')
        if ' ' in code:
            parts = code.split()
            if len(parts) >= 2:
                subjects.add(parts[1])
    
    return {"subjects": sorted(list(subjects))}

# AI Advisor endpoint
@router.post("/api/ai-advisor/")
async def ai_career_advisor(request: dict):
    """AI-powered career advisor"""
    from app.ai_advisor import get_career_recommendations

    career_goal = request.get("career_goal", "")
    major = request.get("major", "Computer Science")
    school = request.get("school", "")  # Optional school filter
    
    if not career_goal:
        raise HTTPException(status_code=400, detail="Career goal is required")
    
    courses = get_all_courses()
    
    # Filter by school if specified
    if school:
        courses = [c for c in courses if c.get('school', '').lower() == school.lower()]
    
    recommendations = get_career_recommendations(
        career_goal=career_goal,
        available_courses=courses,
        current_major=major
    )
    
    return recommendations

# Professor endpoints (unchanged)
@router.get("/api/professors/")
async def get_professors(department: str = None):
    """Get all professors, optionally filtered by department"""
    from app.professor_data import get_all_professors, get_professors_by_department
    
    if department and department.lower() != "all":
        professors = get_professors_by_department(department)
    else:
        professors = get_all_professors()
    
    return {"professors": professors, "total": len(professors)}

@router.post("/api/gemini/")
async def gemini_endpoint(body: dict = Body(...)):
    """Handle requests to the Gemini AI model."""
    prompt = body.get('prompt')
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    model = body.get('model')
    print(f"/api/gemini/ called; model={model}")
    result = await generate_ai_response(prompt, model)

    text = None
    if isinstance(result, dict):
        text = result.get('result')
    elif isinstance(result, str):
        text = result

    if text:
        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                return parsed
            return {"result": parsed, "model": result.get('model') if isinstance(result, dict) else None}
        except Exception:
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

@router.post("/api/chatbot/")
async def chatbot_conversation(request: dict):
    """AI chatbot for course planning assistance"""
    from app.config import Config
    
    user_message = request.get("message", "")
    chat_history = request.get("history", [])
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    courses = get_all_courses()
    course_count = len(courses)
    
    # Get sample schools for better responses
    schools = set()
    for course in courses[:50]:  # Sample first 50 courses
        if school := course.get('school'):
            schools.add(school)
    school_list = ", ".join(sorted(list(schools))[:10])
    
    website_knowledge = f"""
WEBSITE STRUCTURE & NAVIGATION:
The BU Course Planner has 5 main sections accessible from the top navigation bar:

1. HOME (/) - Landing page with overview and quick access buttons
2. EXPLORER (/explorer) - Browse and search {course_count} BU courses with filters
3. PLANNER (/planner) - Drag-and-drop semester planning with PDF export
4. PROGRESS (/progress) - AI career advisor for personalized course recommendations
5. PROFESSORS (/professors) - Research faculty publications and generate cold emails

KEY FEATURES & HOW TO USE THEM:

📚 COURSE SEARCH (Explorer page):
- Use the search bar to find courses by name, code, or keyword
- Filter by school: {school_list}, and more
- Filter by level: Introductory, Intermediate, Advanced, Graduate
- Click any course card to see full details

📅 SEMESTER PLANNING (Planner page):
- Click "Add Semester" button to create a new semester
- Drag courses from the left sidebar into semester boards
- Prerequisites are validated automatically
- Export your plan to PDF with the "Export to PDF" button
- Visual prerequisite flow shows course dependencies

🎯 CAREER ADVISOR (Progress page):
- Choose from preset career paths OR enter a custom career goal
- AI analyzes your goal and recommends optimal courses
- See required skills and skill coverage percentage
- Click "Get Recommendations" to get AI-powered advice

👨🏫 PROFESSOR RESEARCH (Professors page):
- Browse all BU professors by department
- Click a professor's name to see their research and publications
- View research areas from OpenAlex database
- Generate AI-powered professional cold emails

NAVIGATION TIPS:
- All main pages are accessible from the top navigation bar
- Home page has quick action buttons for each feature
- Use the chatbot (me!) anytime for help navigating
"""
    
    # Provide rule-based responses for common questions when API is not available
    def get_fallback_response(message: str) -> str:
        msg_lower = message.lower()
        
        # Navigation questions
        if any(word in msg_lower for word in ['find', 'search', 'look for', 'where']) and 'course' in msg_lower:
            return "To search for courses, go to the **Explorer** page (click 'Explorer' in the top menu). You can use the search bar to find courses by name or code, and use the filters to narrow by school or level."
        
        if 'plan' in msg_lower and any(word in msg_lower for word in ['semester', 'schedule']):
            return "To plan your semesters, go to the **Planner** page (click 'Planner' in the top menu). Click 'Add Semester' to create a semester, then drag courses from the left sidebar into your semester boards. You can export your plan to PDF when done!"
        
        if 'career' in msg_lower or 'recommendation' in msg_lower:
            return "For career advice and course recommendations, go to the **Progress** page (click 'Progress' in the top menu). You can browse preset career paths or enter your own custom career goal to get AI-powered course recommendations!"
        
        if 'professor' in msg_lower or 'faculty' in msg_lower:
            return "To research professors, go to the **Professors** page (click 'Professors' in the top menu). You can browse by department, view their publications, and even generate professional cold emails to reach out to them."
        
        if 'export' in msg_lower or 'pdf' in msg_lower:
            return "To export your semester plan to PDF, go to the **Planner** page and click the 'Export to PDF' button at the top. Make sure you've added some courses to your semesters first!"
        
        if any(word in msg_lower for word in ['navigate', 'use', 'how', 'help', 'guide']):
            return f"""I can help you navigate the BU Course Planner! Here are the main sections:

📚 **Explorer** - Search and browse {course_count} courses
📅 **Planner** - Drag-and-drop semester planning
🎯 **Progress** - Get AI career recommendations
👨🏫 **Professors** - Research faculty and publications

What would you like to do? I can give you specific directions!"""
        
        # Default response
        return f"""I'm here to help you navigate the BU Course Planner! The site has 5 main sections:

• **Home** - Overview and quick links
• **Explorer** - Search {course_count} BU courses
• **Planner** - Plan your semesters with drag-and-drop
• **Progress** - Get AI career advice
• **Professors** - Research faculty

What would you like help with? Ask me about finding courses, planning semesters, career recommendations, or researching professors!"""
    
    # Check if API key is configured
    if not Config.GOOGLE_API_KEY:
        # Provide helpful fallback response
        fallback = get_fallback_response(user_message)
        return {
            "response": fallback,
            "model": "fallback",
            "message": user_message
        }
    
    # Use AI if API key is available
    from app.ai_advisor import generate_ai_response
    
    context = f"""You are an AI assistant for the BU Course Planner website. You help Boston University students with course planning and navigating the website.

{website_knowledge}

Previous conversation:
{chr(10).join([f"{msg['role']}: {msg['content']}" for msg in chat_history[-5:]])}

Current user question: {user_message}

INSTRUCTIONS:
- Be helpful, friendly, and conversational
- Give specific navigation directions (e.g., "Click on 'Explorer' in the top menu")
- Reference the exact page names and button labels from the website structure above
- Suggest relevant features based on user needs
- Keep responses concise (2-4 sentences) but informative
- Use emojis sparingly for visual appeal
- If asked about courses, mention that there are {course_count} courses available
- Guide users to the right page for their needs with clear step-by-step directions"""
    
    try:
        response = await generate_ai_response(context)
        return {
            "response": response.get("result", ""),
            "model": response.get("model", ""),
            "message": user_message
        }
    except Exception as e:
        # If AI fails, use fallback
        fallback = get_fallback_response(user_message)
        return {
            "response": fallback,
            "model": "fallback",
            "message": user_message
        }

@router.get("/api/ai-models/")
async def list_ai_models():
    """List available AI models"""
    try:
        from app.ai_advisor import get_available_models
        models = get_available_models()
        return {"models": models}
    except Exception as e:
        return {"error": str(e), "models": []}