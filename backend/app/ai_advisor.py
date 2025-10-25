import google.generativeai as genai
from typing import List, Dict
from app.config import Config
import json
import re

# Configure Google AI
if Config.GOOGLE_API_KEY:
    genai.configure(api_key=Config.GOOGLE_API_KEY)

def get_career_recommendations(
    career_goal: str,
    available_courses: List[Dict],
    current_major: str = "Computer Science"
) -> Dict:
    """
    Use Google Gemini to recommend courses for any career goal.
    Works for any major, not just CS!
    """
    
    if not Config.GOOGLE_API_KEY:
        return {
            "error": "Google API key not configured",
            "message": "Please add GOOGLE_API_KEY to backend/.env file to use AI recommendations"
        }
    
    # Format courses for Gemini
    courses_text = "\n".join([
        f"- {c['code']}: {c['title']} ({c.get('description', '')[:100]}...)" 
        for c in available_courses[:20]
    ])
    
    prompt = f"""You are a career advisor helping a {current_major} student plan their courses.

Career Goal: {career_goal}

Available Courses:
{courses_text}

Based on this career goal, please:
1. Identify 5-8 key skills needed for this career
2. Recommend 5-8 courses from the list that would best prepare the student
3. Explain how each recommended course contributes to the career goal
4. Estimate what percentage of required skills these courses would cover

Return your response in this JSON format:
{{
  "career_analysis": "Brief analysis of the career path",
  "required_skills": ["skill1", "skill2", ...],
  "recommended_courses": [
    {{
      "code": "COURSE CODE",
      "relevance": "How this course helps with the career goal",
      "skills_taught": ["skill1", "skill2"]
    }}
  ],
  "skill_coverage_percentage": 85,
  "additional_advice": "Any additional recommendations"
}}

Only return the JSON, no other text.
"""

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        
        return {"error": "Could not parse AI response"}
        
    except Exception as e:
        return {
            "error": str(e),
            "message": "Failed to get AI recommendations. Check your API key."
        }
