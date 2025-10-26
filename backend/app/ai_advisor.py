from typing import List, Dict, Optional
from app.config import Config
import json
import re
# import httpx  <-- No longer needed
from fastapi import HTTPException
import google.generativeai as genai

# Configure the Google AI client at the top of the file
if Config.GOOGLE_API_KEY:
    genai.configure(api_key=Config.GOOGLE_API_KEY)
else:
    print("⚠️  GOOGLE_API_KEY not set - AI features will be disabled")

async def generate_ai_response(prompt: str, model: Optional[str] = None) -> dict:
    """Generate AI response using Google's Gemini API."""
    
    if not Config.GOOGLE_API_KEY:
        raise HTTPException(status_code=400, detail="GOOGLE_API_KEY not set in environment")
    
    # List of models to try, in order of preference
    model_candidates = [
        "gemini-pro",
        "gemini-1.0-pro",
        "chat-bison-001",
        "text-bison-001",
        "text-unicorn-001"
    ]
    
    # If a specific model is requested, try it first
    if model:
        model_candidates.insert(0, model)
    
    # Try each model until one works
    last_error = None
    for model_name in model_candidates:
        try:
            print(f"Trying model: {model_name}")  # Debug log
    
    model_found = False
    for model_name in model_candidates:
        try:
            print(f"Attempting to use model: {model_name}")
            
            # Initialize the model
            model_instance = genai.GenerativeModel(model_name)
            
            # Try to generate content
            response = await model_instance.generate_content_async(
                prompt,
                generation_config={
                    "temperature": 0.7,
                    "top_k": 40,
                    "top_p": 0.95,
                    "max_output_tokens": 1024
                }
            )
            
            # If we get here, the model worked
            model_found = True
            
            # Extract text
            if response.text:
                print(f"Success with model: {model_name}")
                return {"result": response.text.strip()}
            
            # Handle cases where no text is returned
            feedback = response.prompt_feedback or "No text content found in response."
            return {"result": str(feedback)}
            
        except Exception as e:
            last_error = str(e)
            print(f"Failed with model {model_name}: {last_error}")
            continue  # Try next model
    
    # If we get here, no models worked
    error_message = f"No available models found. Last error: {last_error}"
    print(f"All models failed: {error_message}")
    raise HTTPException(
        status_code=404,
        detail=error_message
    )

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

    # List of models to try
    model_candidates = [
        "gemini-pro",
        "gemini-1.0-pro",
        "chat-bison-001",
        "text-bison-001",
        "text-unicorn-001"
    ]
    
    for model_name in model_candidates:
        try:
            print(f"Trying career recommendations with model: {model_name}")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            response_text = response.text
            
            # If we get here, we found a working model
            print(f"Successfully generated career recommendations with model: {model_name}")
            break
            
        except Exception as e:
            print(f"Failed with model {model_name}: {str(e)}")
            response_text = None
            continue
    
    if not response_text:
        return {
            "error": "No available AI models found",
            "message": "Please check your API key and enabled models."
        }
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        
        return {"error": "Could not parse AI response", "raw_response": response_text}
        
    except Exception as e:
        return {
            "error": str(e),
            "message": "Failed to get AI recommendations. Check your API key."
        }