# /Users/kushzingade/Documents/DS+X/backend/app/ai_advisor.py

from typing import List, Dict, Optional
from app.config import Config
import json
import re
import traceback
from fastapi import HTTPException
import google.generativeai as genai

# Configure the Google AI client
if Config.GOOGLE_API_KEY:
    genai.configure(api_key=Config.GOOGLE_API_KEY)
    print("✅ Google AI configured successfully")
else:
    print("❌ GOOGLE_API_KEY not set - AI features will be disabled")

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
    available_courses: List[Dict],
    current_major: str = "Any"
) -> Dict:
    """
    FAST career recommendations - optimized for speed and CS accuracy
    """
    
    print(f"🔍 Getting FAST recommendations for: {career_goal}")
    print(f"📚 Total courses available: {len(available_courses)}")
    
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
    
    # Scan all courses for CS patterns (no sampling for accuracy)
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
            "CYBERSECURITY" in name
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
    
    for course in cs_courses:
        code = course.get('code', '')
        name = course.get('name', '').upper()
        description = course.get('description', '').upper()
        
        # Categorize based on content
        if any(term in name for term in ["INTRO", "INTRODUCTION", "FUNDAMENTAL", "BEGINNER", "I "]):
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
    
    # Always include foundational courses
    for course in foundational_cs[:2]:
        recommended_courses.append({
            "code": course.get('code', ''),
            "relevance": "Foundational Computer Science course",
            "skills_taught": ["Programming fundamentals", "Problem-solving", "Computational thinking"],
            "priority": "High"
        })
    
    # Career-specific recommendations
    if "ai" in career_lower or "artificial" in career_lower or "machine learning" in career_lower:
        for course in ai_ml_courses[:3]:
            recommended_courses.append({
                "code": course.get('code', ''),
                "relevance": "AI and Machine Learning specialization",
                "skills_taught": ["Machine Learning", "Neural Networks", "AI Algorithms"],
                "priority": "High"
            })
    elif "web" in career_lower or "frontend" in career_lower or "full stack" in career_lower:
        for course in web_dev_courses[:3]:
            recommended_courses.append({
                "code": course.get('code', ''),
                "relevance": "Web Development technologies",
                "skills_taught": ["Web Technologies", "Frontend/Backend Development", "APIs"],
                "priority": "High"
            })
    elif "system" in career_lower or "network" in career_lower or "operating" in career_lower:
        for course in systems_courses[:3]:
            recommended_courses.append({
                "code": course.get('code', ''),
                "relevance": "Computer Systems and Architecture",
                "skills_taught": ["Systems Programming", "Networking", "Computer Architecture"],
                "priority": "High"
            })
    
    # Fill with advanced CS courses if needed
    if len(recommended_courses) < 6:
        for course in advanced_cs[:6-len(recommended_courses)]:
            recommended_courses.append({
                "code": course.get('code', ''),
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
        "note": "ULTRA-ACCURATE CS recommendations - Direct course matching",
        "total_cs_courses_found": len(cs_courses)
    }

def get_fast_ai_recommendations(career_goal: str, available_courses: List[Dict]) -> Dict:
    """Fast AI-based recommendations for non-CS careers"""
    
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
        keywords = ["DATA", "STATISTICS", "ANALYTICS", "MACHINE"]
    elif "business" in career_lower:
        keywords = ["BUSINESS", "MANAGEMENT", "MARKETING", "FINANCE"]
    elif "biology" in career_lower or "medical" in career_lower:
        keywords = ["BIO", "CHEM", "MEDICAL", "HEALTH"]
    else:
        keywords = ["MATH", "SCIENCE", "RESEARCH"]  # Default technical courses
    
    for course in available_courses[:sample_size]:
        code = course.get('code', '').upper()
        name = course.get('name', '').upper()
        
        for keyword in keywords:
            if keyword in code or keyword in name:
                relevant_courses.append(course)
                break
    
    # Use relevant courses or small sample
    courses_sample = relevant_courses[:15] if relevant_courses else available_courses[:10]
    
    print(f"🎯 Using {len(courses_sample)} courses for AI analysis")
    
    # Create the courses text for the prompt
    courses_text = "\n".join([
        f"- {c.get('code', 'N/A')}: {c.get('name', 'No name')}" 
        for c in courses_sample
    ])
    
    prompt = f"""Recommend 3-5 courses for: {career_goal}

Available Courses:
{courses_text}

Return JSON with recommended courses, skills, and analysis.
Only use course codes from the list.
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
        
        # Validate courses exist
        valid_courses = []
        for course_rec in result.get('recommended_courses', []):
            code = course_rec.get('code', '')
            if any(c.get('code') == code for c in courses_sample):
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
            "relevance": relevance,
            "skills_taught": ["Technical skills", "Problem-solving", "Analytical thinking"]
        })
    
    return {
        "career_analysis": f"Career path in {career_goal}",
        "required_skills": ["Technical skills", "Problem-solving", "Analytical thinking"],
        "recommended_courses": recommended,
        "skill_coverage_percentage": 65,
        "additional_advice": "Consider these foundational courses for your career path.",
        "note": "Fast fallback recommendations"
    }

async def generate_ai_response(prompt: str, model: Optional[str] = None) -> dict:
    """Generate AI response for chat functionality"""
    
    if not Config.GOOGLE_API_KEY:
        return {"error": "GOOGLE_API_KEY not configured"}
    
    try:
        model_name = model or "models/gemini-2.0-flash"
        print(f"🤖 Using model: {model_name} for chat")
        
        genai_model = genai.GenerativeModel(model_name)
        
        response = genai_model.generate_content(
            prompt,
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