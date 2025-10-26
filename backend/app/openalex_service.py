import requests
from typing import Dict, List, Optional
import google.generativeai as genai
from app.config import Config

# Configure Google AI
if Config.GOOGLE_API_KEY:
    genai.configure(api_key=Config.GOOGLE_API_KEY)

OPENALEX_API = "https://api.openalex.org"

def get_author_data(openalex_id: str) -> Optional[Dict]:
    """
    Fetch author data from OpenAlex API
    Example ID: A5023147820 or full URL
    """
    # Extract ID from URL if full URL provided
    if 'openalex.org' in openalex_id:
        openalex_id = openalex_id.split('/')[-1]
    
    url = f"{OPENALEX_API}/authors/{openalex_id}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching OpenAlex data: {e}")
        return None

def get_author_works(openalex_id: str, limit: int = 10) -> List[Dict]:
    """Get recent publications by an author"""
    if 'openalex.org' in openalex_id:
        openalex_id = openalex_id.split('/')[-1]
    
    url = f"{OPENALEX_API}/works"
    params = {
        'filter': f'author.id:{openalex_id}',
        'sort': 'publication_date:desc',
        'per-page': limit
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json().get('results', [])
    except Exception as e:
        print(f"Error fetching works: {e}")
        return []

def get_coauthors(openalex_id: str, limit: int = 10) -> List[Dict]:
    """Get frequent collaborators"""
    works = get_author_works(openalex_id, limit=50)
    
    coauthor_counts = {}
    
    for work in works:
        for authorship in work.get('authorships', []):
            author = authorship.get('author', {})
            author_id = author.get('id', '')
            
            # Skip self
            if openalex_id in author_id:
                continue
            
            author_name = author.get('display_name', 'Unknown')
            
            if author_id not in coauthor_counts:
                coauthor_counts[author_id] = {
                    'id': author_id,
                    'name': author_name,
                    'count': 0,
                    'institutions': []
                }
            
            coauthor_counts[author_id]['count'] += 1
            
            # Get institution
            institutions = authorship.get('institutions', [])
            if institutions:
                inst_name = institutions[0].get('display_name', '')
                if inst_name and inst_name not in coauthor_counts[author_id]['institutions']:
                    coauthor_counts[author_id]['institutions'].append(inst_name)
    
    # Sort by collaboration count
    sorted_coauthors = sorted(
        coauthor_counts.values(),
        key=lambda x: x['count'],
        reverse=True
    )
    
    return sorted_coauthors[:limit]

def generate_research_summary(author_data: Dict, works: List[Dict]) -> str:
    """Generate a text summary of research"""
    
    summary = f"Professor {author_data.get('display_name')} has published {author_data.get('works_count', 0)} works "
    summary += f"with {author_data.get('cited_by_count', 0)} total citations "
    summary += f"and an h-index of {author_data.get('summary_stats', {}).get('h_index', 0)}.\n\n"
    
    # Top research areas
    concepts = author_data.get('x_concepts', [])[:5]
    if concepts:
        summary += "Primary research areas: "
        summary += ", ".join([c.get('display_name', '') for c in concepts])
        summary += "\n\n"
    
    # Recent notable work
    if works:
        summary += "Recent notable publications:\n"
        for work in works[:3]:
            title = work.get('title', 'Untitled')
            year = work.get('publication_year', 'N/A')
            citations = work.get('cited_by_count', 0)
            summary += f"- {title} ({year}) - {citations} citations\n"
    
    return summary
def generate_cold_email(
    professor_name: str,
    research_summary: str,
    student_interests: str,
    course_context: str = ""
) -> str:
    """Generate personalized cold email using Google Gemini"""
    
    if not Config.GOOGLE_API_KEY:
        return "Error: Google API key not configured. Please add GOOGLE_API_KEY to .env file."
    
    try:
        prompt = f"""Generate a professional, personalized cold email from a student to a professor expressing interest in research opportunities.

Professor: {professor_name}

Professor's Research:
{research_summary}

Student's Interests:
{student_interests}

{f"Course Context: The student is planning to take or has taken {course_context}" if course_context else ""}

Guidelines:
- Keep it concise (under 200 words)
- Show genuine interest in specific research areas based on the professor's actual work
- Mention relevant background/skills
- Professional but not overly formal
- Clear ask for meeting/research opportunity
- Personalized based on professor's actual research
- Include a subject line

Format as:
Subject: [subject line]

Dear Professor [Last Name],

[email body]

Best regards,
[Student Name]

Generate the email:"""

        # Use the available Gemini 2.0 models
        model_names = [
            'models/gemini-2.0-flash',           # Fast and efficient
            'models/gemini-2.0-flash-001',       # Specific version
            'models/gemini-2.0-flash-exp',       # Experimental version
            'models/gemini-2.0-pro-exp',         # Pro experimental
            'models/gemini-pro-latest',          # Pro latest
            'models/gemini-flash-latest',        # Flash latest
        ]
        
        successful_response = None
        last_error = None
        
        for model_name in model_names:
            try:
                print(f"Trying model: {model_name}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                
                if response.text:
                    successful_response = response.text
                    print(f"Success with model: {model_name}")
                    break
                    
            except Exception as e:
                last_error = str(e)
                print(f"Model {model_name} failed: {e}")
                continue
        
        if successful_response:
            return successful_response
        else:
            return f"Error: No working model found. Last error: {last_error}\n\nPlease check your GOOGLE_API_KEY and try again."
                
    except Exception as e:
        return f"Error generating email: {str(e)}\n\nPlease check your GOOGLE_API_KEY in the .env file."