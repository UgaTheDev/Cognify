import requests
from typing import Dict, List, Optional
import anthropic
import os

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
                    'count': 0
                }
            
            coauthor_counts[author_id]['count'] += 1
    
    # Sort by collaboration count
    sorted_coauthors = sorted(
        coauthor_counts.values(),
        key=lambda x: x['count'],
        reverse=True
    )
    
    return sorted_coauthors[:limit]

def generate_research_summary(author_data: Dict, works: List[Dict]) -> str:
    """Use Claude to generate a research summary"""
    
    # Prepare research context
    research_context = f"""
Professor: {author_data.get('display_name')}
Citation Count: {author_data.get('cited_by_count', 0)}
H-Index: {author_data.get('summary_stats', {}).get('h_index', 0)}
Works Count: {author_data.get('works_count', 0)}

Recent Publications:
"""
    
    for work in works[:10]:
        title = work.get('title', 'Untitled')
        year = work.get('publication_year', 'N/A')
        citations = work.get('cited_by_count', 0)
        research_context += f"\n- {title} ({year}) - {citations} citations"
    
    # Concepts/topics
    concepts = author_data.get('x_concepts', [])[:10]
    if concepts:
        research_context += "\n\nResearch Areas:\n"
        for concept in concepts:
            research_context += f"- {concept.get('display_name')} (score: {concept.get('score', 0):.2f})\n"
    
    return research_context

def generate_cold_email(
    professor_name: str,
    research_summary: str,
    student_interests: str,
    course_context: str = ""
) -> str:
    """Generate personalized cold email using Claude"""
    
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
    
    prompt = f"""Generate a professional, personalized cold email from a student to a professor expressing interest in research opportunities.

Professor: {professor_name}

Professor's Research:
{research_summary}

Student's Interests:
{student_interests}

{f"Course Context: The student is planning to take or has taken {course_context}" if course_context else ""}

Guidelines:
- Keep it concise (under 200 words)
- Show genuine interest in specific research areas
- Mention relevant background/skills
- Professional but not overly formal
- Clear ask for meeting/research opportunity
- Personalized based on professor's actual research

Generate the email:"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return message.content[0].text
    except Exception as e:
        return f"Error generating email: {str(e)}"
