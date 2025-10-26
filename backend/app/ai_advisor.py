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
    
    # Preferred models in order. We'll inspect what models are available
    preferred = [
        "gemini-2.0-pro", "gemini-2.0-flash", "gemini-pro", "gemini-1.0-pro",
        "gemini-1.5-flash", "chat-bison-001", "text-bison-001"
    ]

    # Try to list available models from the client to choose a supported model
    try:
        available = genai.list_models()
        # `available` may be a dict or list depending on library; normalize to list of ids
        model_ids = []
        if isinstance(available, dict):
            # some clients return {'models': [...]}
            for m in available.get('models', []) or []:
                if isinstance(m, dict) and m.get('name'):
                    model_ids.append(m['name'])
                elif isinstance(m, str):
                    model_ids.append(m)
        elif isinstance(available, list):
            for m in available:
                if isinstance(m, dict) and m.get('name'):
                    model_ids.append(m['name'])
                elif isinstance(m, str):
                    model_ids.append(m)
        else:
            # fallback: stringify
            model_ids = [str(available)]
    except Exception as e:
        # If listing models fails, capture the error and continue with preferred list
        print(f"Warning: failed to list models: {e}")
        model_ids = []

    # Build candidate list: requested model first, then preferred models that appear available, then preferred list
    candidates = []
    if model:
        candidates.append(model)
    # add intersection of preferred and available (keep order)
    for p in preferred:
        if model_ids and p in model_ids:
            candidates.append(p)
    # finally, append preferred list to try even if not listed (some clients/project configs differ)
    for p in preferred:
        if p not in candidates:
            candidates.append(p)

    last_error = None
    for candidate in candidates:
        try:
            print(f"Attempting model: {candidate}")
            model_instance = genai.GenerativeModel(candidate)
            # Try async generation if available
            try:
                response = await model_instance.generate_content_async(
                    prompt,
                    generation_config={
                        "temperature": 0.7,
                        "top_k": 40,
                        "top_p": 0.95,
                        "max_output_tokens": 1024
                    }
                )
            except AttributeError:
                # Fallback to sync method
                response = model_instance.generate_content(prompt)

            # Extract text
            text = None
            if hasattr(response, 'text') and response.text:
                text = response.text
            elif isinstance(response, dict):
                # some clients return dict shapes
                # look for candidates -> content -> parts -> text
                candidates_resp = response.get('candidates') or response.get('outputs') or response.get('output')
                if isinstance(candidates_resp, list) and candidates_resp:
                    first = candidates_resp[0]
                    if isinstance(first, dict):
                        # content.parts.text
                        content = first.get('content') or first
                        parts = content.get('parts') if isinstance(content, dict) else None
                        if parts and isinstance(parts, list) and parts[0].get('text'):
                            text = parts[0]['text']
                # fallback to stringifying
                if not text:
                    text = json.dumps(response)

            if text:
                return {"result": str(text).strip(), "model": candidate}

            last_error = "no text in response"
        except Exception as e:
            last_error = str(e)
            print(f"Model {candidate} failed: {last_error}")
            continue

    # nothing worked
    raise HTTPException(status_code=404, detail=f"No usable models available. Last error: {last_error}")

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

    # List of models to try for career recommendations
    model_candidates = [
        "gemini-2.0-pro",
        "gemini-2.0-flash",
        "gemini-pro",
        "gemini-1.0-pro",
        "chat-bison-001",
        "text-bison-001"
    ]

    response_text = None
    last_error = None
    for model_name in model_candidates:
        try:
            print(f"Trying career recommendations with model: {model_name}")
            model = genai.GenerativeModel(model_name)
            # Use synchronous generation here (this function is sync)
            try:
                resp = model.generate_content(prompt)
            except Exception as e:
                # Some clients may raise; capture and continue
                raise

            # Extract text if present
            response_text = getattr(resp, 'text', None) or (resp.get('text') if isinstance(resp, dict) else None) or str(resp)
            print(f"Successfully generated career recommendations with model: {model_name}")
            break

        except Exception as e:
            last_error = str(e)
            print(f"Failed with model {model_name}: {last_error}")
            response_text = None
            continue

    if not response_text:
        return {
            "error": "No available AI models found",
            "message": f"Please check your API key and enabled models. Last error: {last_error}"
        }

    # Extract JSON from response
    try:
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return {"error": "Could not parse AI response", "raw_response": response_text}
    except Exception as e:
        return {
            "error": str(e),
            "message": "Failed to parse AI response"
        }