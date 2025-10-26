# /Users/kushzingade/Documents/DS+X/backend/app/ai_advisor.py

from typing import List, Dict, Optional
from app.config import Config
import json
import re
import traceback
import os
from fastapi import HTTPException
import google.generativeai as genai

# Configure the Google AI client
if Config.GOOGLE_API_KEY:
    genai.configure(api_key=Config.GOOGLE_API_KEY)
    print("✅ Google AI configured successfully")
else:
    print("❌ GOOGLE_API_KEY not set - AI features will be disabled")

# Load all courses data from JSON file
def load_all_courses() -> List[Dict]:
    """Load course data from all_courses.json"""
    try:
        # Assuming the file is in the same directory or parent directory
        json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'all_courses.json')
        # Alternative path if in current directory
        if not os.path.exists(json_path):
            json_path = os.path.join(os.path.dirname(__file__), 'all_courses.json')
        
        with open(json_path, 'r', encoding='utf-8') as f:
            courses_data = json.load(f)
            print(f"✅ Loaded {len(courses_data)} courses from all_courses.json")
            return courses_data
    except Exception as e:
        print(f"❌ Error loading all_courses.json: {e}")
        return []

# Global variable to store loaded courses
ALL_COURSES = load_all_courses()

def get_available_models():
    """Get list of available models"""
    try:
        models = genai.list_models()
        return [model.name for model in models]
    except Exception as e:
        print(f"Error getting available models: {e}")
        return []

def get_career_recommendations(
    career_goal: str,
    available_courses: List[Dict] = None,
    current_major: str = "Any"
) -> Dict:
    """
    FAST career recommendations - optimized for speed and accuracy using all_courses.json
    """
    
    print(f"🔍 Getting FAST recommendations for: {career_goal}")
    
    # Use ALL_COURSES if no specific available_courses provided
    if available_courses is None:
        available_courses = ALL_COURSES
        print(f"📚 Using all {len(available_courses)} courses from all_courses.json")
    else:
        print(f"📚 Using provided {len(available_courses)} courses")
    
    if not Config.GOOGLE_API_KEY:
        return {
            "error": "Google API key not configured",
            "message": "Please add GOOGLE_API_KEY to backend/.env file"
        }
    
    # ULTRA-ACCURATE: Direct course matching for CS and related careers
    career_lower = career_goal.lower()
    
    # Comprehensive CS-related keywords
    cs_keywords = [
        "software", "computer", "programming", "cs", "engineer", "developer",
        "ai", "artificial intelligence", "machine learning", "data science",
        "computer science", "computing", "tech", "technology", "coding",
        "full stack", "web development", "mobile development", "backend", "frontend",
        "data engineer", "ml engineer", "ai engineer", "devops", "cloud",
        "cybersecurity", "security", "information technology", "it"
    ]
    
    # Check if career is CS-related
    if any(keyword in career_lower for keyword in cs_keywords):
        print("🎯 Using ULTRA-ACCURATE CS course mapping")
        return get_cs_recommendations_ultra_accurate(available_courses, career_goal)
    
    # For non-CS careers, use fast AI with fallback
    return get_fast_ai_recommendations(career_goal, available_courses)

def get_cs_recommendations_ultra_accurate(available_courses: List[Dict], career_goal: str) -> Dict:
    """ULTRA-ACCURATE CS course recommendations with comprehensive matching"""
    
    # Comprehensive CS course patterns
    cs_courses = []
    
    # Scan all courses for CS patterns using both code and name
    for course in available_courses:
        code = course.get('code', '').upper()
        name = course.get('name', '').upper()
        description = course.get('description', '').upper()
        
        # Comprehensive CS pattern matching
        cs_patterns = [
            # Direct CS department codes
            code.startswith("CAS CS"), 
            code.startswith("CS "),
            " CS " in code,
            " CS-" in code,
            "CSCI" in code,
            "COMPSCI" in code,
            "COMPUTER SCIENCE" in name,
            "COMPUTER SCIENCE" in description,
            
            # Related technical fields
            "SOFTWARE ENGINEER" in name,
            "PROGRAMMING" in name,
            "ALGORITHM" in name,
            "DATA STRUCTURE" in name,
            "ARTIFICIAL INTELLIGENCE" in name,
            "MACHINE LEARNING" in name,
            "DATA SCIENCE" in name,
            "COMPUTER SYSTEM" in name,
            "OPERATING SYSTEM" in name,
            "DATABASE" in name,
            "NETWORK" in name,
            "WEB DEVELOPMENT" in name,
            "MOBILE DEVELOPMENT" in name,
            "CLOUD COMPUTING" in name,
            "CYBERSECURITY" in name,
            
            # Math courses important for CS
            "DISCRETE" in name,
            "CALCULUS" in name,
            "LINEAR ALGEBRA" in name,
            "STATISTICS" in name,
            "PROBABILITY" in name
        ]
        
        if any(cs_patterns):
            cs_courses.append(course)
    
    print(f"🎯 Found {len(cs_courses)} CS-related courses")
    
    # Categorize CS courses for better recommendations
    foundational_cs = []
    advanced_cs = []
    ai_ml_courses = []
    systems_courses = []
    web_dev_courses = []
    math_courses = []
    
    for course in cs_courses:
        code = course.get('code', '')
        name = course.get('name', '').upper()
        description = course.get('description', '').upper()
        
        # Categorize based on content
        if any(term in name for term in ["DISCRETE", "CALCULUS", "LINEAR ALGEBRA", "STATISTIC", "PROBABILITY"]):
            math_courses.append(course)
        elif any(term in name for term in ["INTRO", "INTRODUCTION", "FUNDAMENTAL", "BEGINNER", "I "]):
            foundational_cs.append(course)
        elif any(term in name for term in ["AI", "ARTIFICIAL", "MACHINE LEARNING", "NEURAL", "DEEP LEARNING"]):
            ai_ml_courses.append(course)
        elif any(term in name for term in ["SYSTEM", "OPERATING", "NETWORK", "ARCHITECTURE", "COMPILER"]):
            systems_courses.append(course)
        elif any(term in name for term in ["WEB", "MOBILE", "FRONTEND", "BACKEND", "FULL STACK"]):
            web_dev_courses.append(course)
        else:
            advanced_cs.append(course)
    
    # Build recommendations based on career focus
    career_lower = career_goal.lower()
    recommended_courses = []
    
    # Always include foundational courses and math
    for course in foundational_cs[:2]:
        recommended_courses.append({
            "code": course.get('code', ''),
            "name": course.get('name', ''),
            "relevance": "Foundational Computer Science course",
            "skills_taught": ["Programming fundamentals", "Problem-solving", "Computational thinking"],
            "priority": "High"
        })
    
    # Include relevant math courses
    for course in math_courses[:2]:
        recommended_courses.append({
            "code": course.get('code', ''),
            "name": course.get('name', ''),
            "relevance": "Mathematical foundation for Computer Science",
            "skills_taught": ["Mathematical reasoning", "Logical thinking", "Analytical skills"],
            "priority": "High"
        })
    
    # Career-specific recommendations
    if "ai" in career_lower or "artificial" in career_lower or "machine learning" in career_lower:
        for course in ai_ml_courses[:3]:
            recommended_courses.append({
                "code": course.get('code', ''),
                "name": course.get('name', ''),
                "relevance": "AI and Machine Learning specialization",
                "skills_taught": ["Machine Learning", "Neural Networks", "AI Algorithms"],
                "priority": "High"
            })
    elif "web" in career_lower or "frontend" in career_lower or "full stack" in career_lower:
        for course in web_dev_courses[:3]:
            recommended_courses.append({
                "code": course.get('code', ''),
                "name": course.get('name', ''),
                "relevance": "Web Development technologies",
                "skills_taught": ["Web Technologies", "Frontend/Backend Development", "APIs"],
                "priority": "High"
            })
    elif "system" in career_lower or "network" in career_lower or "operating" in career_lower:
        for course in systems_courses[:3]:
            recommended_courses.append({
                "code": course.get('code', ''),
                "name": course.get('name', ''),
                "relevance": "Computer Systems and Architecture",
                "skills_taught": ["Systems Programming", "Networking", "Computer Architecture"],
                "priority": "High"
            })
    
    # Fill with advanced CS courses if needed
    if len(recommended_courses) < 6:
        for course in advanced_cs[:6-len(recommended_courses)]:
            recommended_courses.append({
                "code": course.get('code', ''),
                "name": course.get('name', ''),
                "relevance": "Advanced Computer Science topics",
                "skills_taught": ["Advanced algorithms", "Software engineering", "Technical specialization"],
                "priority": "Medium"
            })
    
    # Career-specific analysis
    career_analysis_map = {
        "software": "Software engineering careers require strong programming fundamentals, algorithm knowledge, data structures, software design patterns, and system architecture understanding.",
        "ai": "AI and Machine Learning careers require mathematics fundamentals, statistics, machine learning algorithms, neural networks, and data processing skills.",
        "web": "Web development careers require frontend technologies, backend frameworks, database management, API design, and deployment skills.",
        "data": "Data science careers require statistics, data analysis, machine learning, data visualization, and big data processing skills.",
        "system": "Systems engineering careers require operating systems knowledge, networking, distributed systems, and low-level programming skills."
    }
    
    # Determine the best analysis
    career_analysis = "Computer Science careers require strong programming fundamentals, algorithm knowledge, data structures, and software engineering principles."
    for key, analysis in career_analysis_map.items():
        if key in career_lower:
            career_analysis = analysis
            break
    
    return {
        "career_analysis": career_analysis,
        "required_skills": ["Programming", "Algorithms", "Data Structures", "Problem-solving", "Software Design"],
        "recommended_courses": recommended_courses[:6],  # Max 6 courses
        "skill_coverage_percentage": 85,
        "additional_advice": "Build real projects, contribute to open source, and create a strong portfolio. Practice algorithm problems regularly.",
        "note": "ULTRA-ACCURATE CS recommendations - Direct course matching from all_courses.json",
        "total_cs_courses_found": len(cs_courses)
    }

def get_fast_ai_recommendations(career_goal: str, available_courses: List[Dict]) -> Dict:
    """Fast AI-based recommendations for non-CS careers using course names and descriptions"""
    
    # Use only reliable models that work
    model_candidates = [
        "models/gemini-2.0-flash",  # Fast and reliable
        "models/gemini-2.0-flash-001",
    ]
    
    # Quick pre-filter for relevant courses
    relevant_courses = []
    sample_size = min(200, len(available_courses))  # Small sample
    
    career_lower = career_goal.lower()
    
    # Simple keyword matching for non-CS careers
    keywords = []
    if "data" in career_lower:
        keywords = ["DATA", "STATISTICS", "ANALYTICS", "MACHINE", "ANALYSIS"]
    elif "business" in career_lower:
        keywords = ["BUSINESS", "MANAGEMENT", "MARKETING", "FINANCE", "ECONOMICS"]
    elif "biology" in career_lower or "medical" in career_lower:
        keywords = ["BIO", "CHEM", "MEDICAL", "HEALTH", "BIOLOGY"]
    else:
        keywords = ["MATH", "SCIENCE", "RESEARCH", "ANALYSIS"]  # Default technical courses
    
    for course in available_courses[:sample_size]:
        code = course.get('code', '').upper()
        name = course.get('name', '').upper()
        description = course.get('description', '').upper()
        
        for keyword in keywords:
            if (keyword in code or keyword in name or 
                (description and keyword in description)):
                relevant_courses.append(course)
                break
    
    # Use relevant courses or small sample
    courses_sample = relevant_courses[:15] if relevant_courses else available_courses[:10]
    
    print(f"🎯 Using {len(courses_sample)} courses for AI analysis")
    
    # Create the courses text for the prompt with names and descriptions
    courses_text = "\n".join([
        f"- {c.get('code', 'N/A')}: {c.get('name', 'No name')} - {c.get('description', 'No description available')}" 
        for c in courses_sample
    ])
    
    prompt = f"""Recommend 3-5 courses for: {career_goal}

Available Courses with descriptions:
{courses_text}

Return JSON with:
- career_analysis: brief analysis of required skills
- required_skills: list of key skills needed
- recommended_courses: array of courses with code, name, relevance, skills_taught, priority
- skill_coverage_percentage: estimated percentage
- additional_advice: practical advice

Only use course codes from the provided list.
Base recommendations on course names and descriptions.
"""
    
    response_text = None
    
    for model_name in model_candidates:
        try:
            print(f"🔄 Trying model: {model_name}")
            model = genai.GenerativeModel(model_name)
            
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 800,
                }
            )
            
            if hasattr(response, 'text'):
                response_text = response.text
                print(f"✅ Got response from {model_name}")
                break

        except Exception as e:
            print(f"❌ Model {model_name} failed: {e}")
            continue

    if not response_text:
        print("❌ All models failed, using fallback")
        return get_fallback_recommendations(career_goal, courses_sample)

    # Parse JSON response
    try:
        cleaned_response = re.sub(r'```json\s*|\s*```', '', response_text).strip()
        result = json.loads(cleaned_response)
        
        # Validate courses exist and add course names
        valid_courses = []
        for course_rec in result.get('recommended_courses', []):
            code = course_rec.get('code', '')
            matching_course = next((c for c in courses_sample if c.get('code') == code), None)
            if matching_course:
                course_rec['name'] = matching_course.get('name', '')
                valid_courses.append(course_rec)
        
        result['recommended_courses'] = valid_courses
        print(f"✅ Parsed {len(valid_courses)} valid courses")
        return result
        
    except:
        print("❌ JSON parse failed, using fallback")
        return get_fallback_recommendations(career_goal, courses_sample)

def get_fallback_recommendations(career_goal: str, courses_sample: List[Dict]) -> Dict:
    """Fallback when AI fails for non-CS careers"""
    print("⚡ Using fast fallback recommendations")
    
    recommended = []
    for course in courses_sample[:5]:
        code = course.get('code', '')
        name = course.get('name', '')
        
        if "CS" in code:
            relevance = f"Computer Science course for {career_goal}"
        elif "ENG" in code:
            relevance = f"Engineering course for {career_goal}"
        else:
            relevance = f"Relevant course for {career_goal}"
        
        recommended.append({
            "code": code,
            "name": name,
            "relevance": relevance,
            "skills_taught": ["Technical skills", "Problem-solving", "Analytical thinking"],
            "priority": "Medium"
        })
    
    return {
        "career_analysis": f"Career path in {career_goal} requires foundational technical and analytical skills.",
        "required_skills": ["Technical skills", "Problem-solving", "Analytical thinking", "Domain knowledge"],
        "recommended_courses": recommended,
        "skill_coverage_percentage": 65,
        "additional_advice": "Consider these foundational courses for your career path. Focus on building both technical and soft skills.",
        "note": "Fast fallback recommendations from all_courses.json"
    }

def find_courses_by_topic(topic: str, max_results: int = 10) -> List[Dict]:
    """Find courses related to a specific topic using course names and descriptions"""
    topic_lower = topic.lower()
    matching_courses = []
    
    for course in ALL_COURSES:
        code = course.get('code', '').lower()
        name = course.get('name', '').lower()
        description = course.get('description', '').lower()
        
        if (topic_lower in code or topic_lower in name or 
            (description and topic_lower in description)):
            matching_courses.append(course)
            
            if len(matching_courses) >= max_results:
                break
    
    return matching_courses

async def generate_ai_response(prompt: str, model: Optional[str] = None) -> dict:
    """Generate AI response for chat functionality with course context"""
    
    if not Config.GOOGLE_API_KEY:
        return {"error": "GOOGLE_API_KEY not configured"}
    
    try:
        model_name = model or "models/gemini-2.0-flash"
        print(f"🤖 Using model: {model_name} for chat")
        
        # If the prompt is about course recommendations, add course context
        course_keywords = ["course", "class", "take", "discrete math", "programming", "cs", "computer science"]
        if any(keyword in prompt.lower() for keyword in course_keywords):
            # Add course database context
            course_context = f"\n\nAvailable courses database: {len(ALL_COURSES)} courses including CS, math, and related fields."
            prompt_with_context = prompt + course_context
        else:
            prompt_with_context = prompt
        
        genai_model = genai.GenerativeModel(model_name)
        
        response = genai_model.generate_content(
            prompt_with_context,
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 800,
            }
        )
        
        if hasattr(response, 'text'):
            return {"result": response.text, "model": model_name}
        else:
            return {"result": str(response), "model": model_name}
            
    except Exception as e:
        print(f"❌ Error in generate_ai_response: {e}")
        return {"error": f"AI service error: {str(e)}"}

# New function specifically for course queries
async def get_course_recommendation(query: str) -> dict:
    """Get course recommendations based on specific queries like 'discrete math'"""
    
    query_lower = query.lower()
    
    # Direct matching for common course queries
    if "discrete" in query_lower and "math" in query_lower:
        discrete_math_courses = find_courses_by_topic("discrete", 5)
        if discrete_math_courses:
            return {
                "query": query,
                "recommended_courses": discrete_math_courses,
                "reasoning": "Discrete mathematics is fundamental for computer science, covering logic, sets, relations, graphs, and combinatorial analysis.",
                "total_found": len(discrete_math_courses)
            }
    
    # Use AI for other queries
    if not Config.GOOGLE_API_KEY:
        return {"error": "Google API key not configured"}
    
    try:
        # Find relevant courses for the query
        relevant_courses = find_courses_by_topic(query_lower, 15)
        courses_text = "\n".join([
            f"- {c.get('code', 'N/A')}: {c.get('name', 'No name')} - {c.get('description', 'No description')}" 
            for c in relevant_courses
        ])
        
        prompt = f"""The user asked: "{query}"

Available relevant courses:
{courses_text}

Recommend the best 3-5 courses and explain why they are relevant to the query.
Focus on course content and how it matches what the user is looking for.
"""
        
        model = genai.GenerativeModel("models/gemini-2.0-flash")
        response = model.generate_content(prompt)
        
        return {
            "query": query,
            "ai_recommendation": response.text if hasattr(response, 'text') else str(response),
            "relevant_courses_found": len(relevant_courses),
            "courses_considered": relevant_courses[:5]  # Show first 5 considered
        }
        
    except Exception as e:
        print(f"❌ Error in get_course_recommendation: {e}")
        return {"error": f"AI service error: {str(e)}"}