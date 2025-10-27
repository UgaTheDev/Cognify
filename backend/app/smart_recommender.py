"""
Intelligent Course Recommendation System
Uses TF-IDF and cosine similarity to match career goals with course titles
Now with school filtering!
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

router = APIRouter()

# Load course data on startup
COURSES_DATA = None
COURSE_LIST = []
AVAILABLE_SCHOOLS = []

def load_courses():
    """Load all courses from the JSON file"""
    global COURSES_DATA, COURSE_LIST, AVAILABLE_SCHOOLS
    
    try:
        # Since routes.py is in app/ directly, go up one level then to processing_csv
        json_path = Path(__file__).parent / "processing_csv" / "output" / "all_courses_data.json"
        
        # If not found, try alternative path
        if not json_path.exists():
            json_path = Path(__file__).parent.parent / "processing_csv" / "output" / "all_courses_data.json"
        
        print(f"📂 Looking for courses at: {json_path}")
        
        if not json_path.exists():
            print(f"❌ Course file not found at {json_path}")
            print(f"Current file location: {Path(__file__)}")
            return
        
        with open(json_path, 'r') as f:
            COURSES_DATA = json.load(f)
        
        # Get list of all schools
        AVAILABLE_SCHOOLS = sorted(list(COURSES_DATA['schools'].keys()))
        
        # Flatten all courses into a single list
        COURSE_LIST = []
        for school_name, school_data in COURSES_DATA['schools'].items():
            for course in school_data['courses']:
                COURSE_LIST.append({
                    'code': course['code'],
                    'name': course['name'],
                    'school': school_name,
                    'hub_areas': list(course['hub_areas'].keys()) if course['hub_areas'] else []
                })
        
        print(f"✅ Loaded {len(COURSE_LIST)} courses from {len(COURSES_DATA['schools'])} schools")
        print(f"📚 Available schools: {', '.join(AVAILABLE_SCHOOLS)}")
        
    except Exception as e:
        print(f"❌ Error loading courses: {e}")
        import traceback
        traceback.print_exc()
        COURSE_LIST = []

# Load courses when module is imported
load_courses()


class CareerRecommendationRequest(BaseModel):
    career_goal: str
    major: str = "Any"
    num_recommendations: int = 9
    school_filters: Optional[List[str]] = None  # NEW: Optional list of schools to filter by


class CourseRecommendation(BaseModel):
    code: str
    name: str
    school: str
    relevance: str
    skills_taught: List[str]
    match_score: float


class RecommendationResponse(BaseModel):
    career_analysis: str
    required_skills: List[str]
    recommended_courses: List[Dict]
    skill_coverage_percentage: int
    additional_advice: str


def extract_skills_from_career(career_goal: str) -> List[str]:
    """Extract implied skills from career goal - UNIVERSAL for all fields"""
    career_lower = career_goal.lower()
    
    skills_map = {
        # Technology & Engineering
        'machine learning': ['Machine Learning', 'Python', 'Statistics', 'Data Analysis', 'AI'],
        'data scien': ['Data Analysis', 'Statistics', 'Python', 'Machine Learning', 'Visualization'],
        'software': ['Programming', 'Software Design', 'Algorithms', 'Data Structures', 'Testing'],
        'web dev': ['Web Development', 'JavaScript', 'HTML/CSS', 'Backend', 'Frontend'],
        'cyber': ['Security', 'Networks', 'Cryptography', 'Ethical Hacking', 'System Administration'],
        'ai': ['Artificial Intelligence', 'Machine Learning', 'Neural Networks', 'Python', 'Mathematics'],
        'engineer': ['Technical Design', 'Problem-solving', 'Systems Thinking', 'Mathematics', 'Analysis'],
        'game': ['Game Design', 'Programming', 'Graphics', '3D Modeling', 'Game Engines'],
        'mobile': ['Mobile Development', 'iOS/Android', 'UI/UX', 'Programming', 'APIs'],
        'cloud': ['Cloud Computing', 'AWS/Azure', 'DevOps', 'Networking', 'Infrastructure'],
        'database': ['Database Design', 'SQL', 'Data Modeling', 'Performance Optimization', 'Backend'],
        'ux': ['User Experience', 'UI Design', 'User Research', 'Prototyping', 'Psychology'],
        'network': ['Networking', 'Protocols', 'Security', 'Infrastructure', 'System Administration'],
        
        # Sciences
        'biolog': ['Research Methods', 'Laboratory Skills', 'Data Analysis', 'Scientific Writing', 'Experimentation'],
        'biotech': ['Biotechnology', 'Laboratory Techniques', 'Data Analysis', 'Research', 'Scientific Method'],
        'chemist': ['Chemical Analysis', 'Laboratory Skills', 'Instrumentation', 'Safety Protocols', 'Research'],
        'physics': ['Mathematical Modeling', 'Experimental Design', 'Data Analysis', 'Problem-solving', 'Computation'],
        'environment': ['Environmental Analysis', 'Sustainability', 'Data Collection', 'Policy Understanding', 'Field Research'],
        'neurosci': ['Cognitive Science', 'Research Methods', 'Data Analysis', 'Neurobiology', 'Experimental Design'],
        'medical': ['Medical Knowledge', 'Patient Care', 'Clinical Skills', 'Anatomy', 'Physiology'],
        'health': ['Public Health', 'Epidemiology', 'Health Policy', 'Data Analysis', 'Communication'],
        'nursing': ['Patient Care', 'Clinical Assessment', 'Medical Knowledge', 'Communication', 'Empathy'],
        
        # Social Sciences
        'psycholog': ['Research Methods', 'Statistical Analysis', 'Counseling', 'Behavioral Assessment', 'Empathy'],
        'sociol': ['Social Research', 'Statistical Analysis', 'Theory Application', 'Critical Thinking', 'Writing'],
        'anthro': ['Ethnographic Research', 'Cultural Analysis', 'Fieldwork', 'Qualitative Methods', 'Writing'],
        'politic': ['Policy Analysis', 'Research Methods', 'Critical Thinking', 'Public Speaking', 'Writing'],
        'international': ['Global Awareness', 'Policy Analysis', 'Language Skills', 'Cultural Competence', 'Research'],
        'social work': ['Counseling', 'Case Management', 'Empathy', 'Communication', 'Crisis Intervention'],
        
        # Business & Economics
        'business': ['Strategic Thinking', 'Financial Analysis', 'Leadership', 'Communication', 'Project Management'],
        'finance': ['Financial Analysis', 'Accounting', 'Risk Management', 'Quantitative Skills', 'Economics'],
        'econom': ['Economic Analysis', 'Statistical Methods', 'Data Interpretation', 'Mathematical Modeling', 'Research'],
        'marketing': ['Market Research', 'Consumer Psychology', 'Digital Marketing', 'Communication', 'Analytics'],
        'management': ['Leadership', 'Strategic Planning', 'Team Management', 'Decision Making', 'Communication'],
        'accounting': ['Financial Reporting', 'Auditing', 'Tax Knowledge', 'Attention to Detail', 'Analysis'],
        'entrepreneur': ['Innovation', 'Business Planning', 'Risk Assessment', 'Leadership', 'Adaptability'],
        'consulting': ['Problem-solving', 'Analytical Thinking', 'Communication', 'Strategy', 'Client Relations'],
        
        # Arts & Humanities
        'art': ['Visual Communication', 'Creative Thinking', 'Technical Skills', 'Art History', 'Critique'],
        'design': ['Visual Design', 'Creative Problem-solving', 'Technical Tools', 'User Research', 'Prototyping'],
        'music': ['Music Theory', 'Performance', 'Composition', 'Ear Training', 'Music History'],
        'theater': ['Performance', 'Stage Presence', 'Voice Training', 'Script Analysis', 'Collaboration'],
        'film': ['Cinematography', 'Editing', 'Storytelling', 'Production', 'Visual Arts'],
        'writing': ['Creative Writing', 'Research', 'Editing', 'Storytelling', 'Grammar'],
        'journalism': ['Investigative Research', 'Writing', 'Interviewing', 'Media Ethics', 'Communication'],
        'english': ['Literary Analysis', 'Critical Thinking', 'Writing', 'Research', 'Communication'],
        'history': ['Historical Research', 'Critical Analysis', 'Writing', 'Source Evaluation', 'Contextualization'],
        'philosophy': ['Critical Thinking', 'Logical Reasoning', 'Ethical Analysis', 'Writing', 'Argumentation'],
        'literature': ['Literary Analysis', 'Critical Reading', 'Writing', 'Cultural Understanding', 'Research'],
        
        # Communications & Media
        'communication': ['Public Speaking', 'Writing', 'Media Production', 'Interpersonal Skills', 'Persuasion'],
        'public relations': ['Media Relations', 'Writing', 'Strategic Communication', 'Crisis Management', 'Networking'],
        'advertising': ['Creative Thinking', 'Copywriting', 'Market Research', 'Campaign Strategy', 'Visual Design'],
        'media': ['Content Creation', 'Digital Media', 'Storytelling', 'Production', 'Editing'],
        
        # Education
        'teaching': ['Pedagogy', 'Curriculum Development', 'Classroom Management', 'Communication', 'Patience'],
        'education': ['Learning Theory', 'Assessment', 'Curriculum Design', 'Child Development', 'Communication'],
        
        # Law & Public Service
        'law': ['Legal Research', 'Analytical Thinking', 'Argumentation', 'Writing', 'Ethics'],
        'legal': ['Legal Analysis', 'Research', 'Writing', 'Critical Thinking', 'Attention to Detail'],
        'public service': ['Public Policy', 'Community Engagement', 'Leadership', 'Communication', 'Ethics'],
        'policy': ['Policy Analysis', 'Research Methods', 'Writing', 'Quantitative Analysis', 'Communication'],
        
        # General Research
        'research': ['Research Methods', 'Data Analysis', 'Critical Thinking', 'Writing', 'Presentation'],
        'analyst': ['Data Analysis', 'Critical Thinking', 'Problem-solving', 'Communication', 'Technical Skills'],
    }
    
    # Find matching skills
    for keyword, skills in skills_map.items():
        if keyword in career_lower:
            return skills
    
    # Universal default skills that apply to ANY career
    return ['Critical Thinking', 'Research Skills', 'Communication', 'Problem-solving', 'Collaboration']


def generate_career_keywords(career_goal: str) -> List[str]:
    """Generate search keywords from career goal"""
    career_lower = career_goal.lower()
    
    keywords = [career_goal]  # Original career goal
    
    # Add related keywords
    keyword_expansions = {
        'machine learning': ['machine learning', 'artificial intelligence', 'neural network', 'deep learning', 'ai', 'data science', 'statistics', 'python', 'algorithms'],
        'data scien': ['data science', 'data analysis', 'statistics', 'machine learning', 'python', 'visualization', 'big data', 'analytics'],
        'software engineer': ['software engineering', 'programming', 'computer science', 'algorithms', 'data structures', 'software design', 'coding'],
        'web dev': ['web development', 'web programming', 'javascript', 'html', 'css', 'frontend', 'backend', 'full stack'],
        'cyber': ['cybersecurity', 'security', 'cryptography', 'network security', 'ethical hacking', 'information security'],
        'biotech': ['biotechnology', 'bioinformatics', 'computational biology', 'genomics', 'biology', 'computer science'],
        'ai': ['artificial intelligence', 'machine learning', 'neural networks', 'deep learning', 'robotics', 'computer vision'],
        'game dev': ['game development', 'game design', 'computer graphics', 'game programming', 'unity', 'game engines'],
        'mobile': ['mobile development', 'ios', 'android', 'app development', 'mobile programming'],
        'cloud': ['cloud computing', 'aws', 'azure', 'devops', 'distributed systems', 'scalability'],
        'database': ['database', 'sql', 'data management', 'database design', 'backend'],
        'ux': ['user experience', 'ux design', 'ui design', 'human-computer interaction', 'usability'],
        'network': ['networking', 'computer networks', 'network protocols', 'internet', 'communication'],
        'anthro': ['anthropology', 'cultural', 'archaeology', 'ethnography', 'social sciences', 'human societies'],
        'psycholog': ['psychology', 'cognitive', 'behavioral', 'mental health', 'counseling', 'human behavior'],
        'sociol': ['sociology', 'social', 'society', 'communities', 'social structures', 'inequality'],
        'econom': ['economics', 'microeconomics', 'macroeconomics', 'econometrics', 'finance', 'markets'],
        'biolog': ['biology', 'life sciences', 'molecular', 'genetics', 'ecology', 'evolution'],
        'chemist': ['chemistry', 'organic', 'inorganic', 'biochemistry', 'chemical', 'molecules'],
        'physics': ['physics', 'mechanics', 'quantum', 'thermodynamics', 'electromagnetism', 'relativity'],
        'mathemat': ['mathematics', 'calculus', 'algebra', 'geometry', 'statistics', 'analysis'],
        'english': ['english', 'literature', 'writing', 'composition', 'rhetoric', 'literary'],
        'history': ['history', 'historical', 'civilization', 'ancient', 'modern', 'world history'],
        'politic': ['political science', 'politics', 'government', 'policy', 'international relations'],
        'business': ['business', 'management', 'entrepreneurship', 'marketing', 'strategy', 'finance'],
        'art': ['art', 'visual arts', 'painting', 'sculpture', 'design', 'studio arts'],
        'music': ['music', 'musical', 'composition', 'theory', 'performance', 'instruments'],
    }
    
    # Add expanded keywords
    for key, expansions in keyword_expansions.items():
        if key in career_lower:
            keywords.extend(expansions)
            break
    
    return keywords


def recommend_courses_smart(career_goal: str, num_courses: int = 9, school_filters: Optional[List[str]] = None) -> List[Dict]:
    """
    Smart course recommendation using TF-IDF and cosine similarity
    NEW: Now with optional school filtering!
    """
    if not COURSE_LIST:
        raise HTTPException(status_code=500, detail="Course data not loaded. Please check server logs.")
    
    # Filter courses by school if specified
    filtered_courses = COURSE_LIST
    if school_filters and len(school_filters) > 0:
        filtered_courses = [c for c in COURSE_LIST if c['school'] in school_filters]
        print(f"🔍 Filtering to {len(filtered_courses)} courses from schools: {', '.join(school_filters)}")
        
        if len(filtered_courses) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"No courses found in selected schools: {', '.join(school_filters)}"
            )
    
    # Generate keywords for the career goal
    career_keywords = generate_career_keywords(career_goal)
    career_text = ' '.join(career_keywords)
    
    # Prepare course texts (combine code and name for better matching)
    course_texts = [f"{course['code']} {course['name']}" for course in filtered_courses]
    
    # Add career text at the beginning
    all_texts = [career_text] + course_texts
    
    # Create TF-IDF vectors
    vectorizer = TfidfVectorizer(
        max_features=500,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=1
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform(all_texts)
    except Exception as e:
        print(f"TF-IDF error: {e}")
        return recommend_courses_fallback(career_goal, num_courses, school_filters)
    
    # Calculate similarity between career goal and all courses
    career_vector = tfidf_matrix[0:1]
    course_vectors = tfidf_matrix[1:]
    
    similarities = cosine_similarity(career_vector, course_vectors)[0]
    
    # Get top N courses
    top_indices = np.argsort(similarities)[::-1][:num_courses * 2]
    
    # Filter out very low similarity scores
    top_indices = [idx for idx in top_indices if similarities[idx] > 0.05]
    
    if len(top_indices) < num_courses:
        return recommend_courses_fallback(career_goal, num_courses, school_filters)
    
    # Ensure diversity - don't recommend too many courses from same school (unless filtering by single school)
    recommended = []
    school_counts = {}
    max_per_school = 3 if not school_filters or len(school_filters) > 1 else num_courses
    
    for idx in top_indices:
        if len(recommended) >= num_courses:
            break
        
        course = filtered_courses[idx]
        school = course['school']
        
        # Limit courses per school
        if school_counts.get(school, 0) >= max_per_school:
            continue
        
        match_score = float(similarities[idx])
        
        # Generate relevance explanation
        relevance = generate_relevance_explanation(career_goal, course, match_score)
        
        # Generate skills taught
        skills = extract_skills_from_course(course['name'], career_goal)
        
        recommended.append({
            'code': course['code'],
            'relevance': relevance,
            'skills_taught': skills,
            'match_score': match_score,
            'name': course['name'],
            'school': school
        })
        
        school_counts[school] = school_counts.get(school, 0) + 1
    
    return recommended


def recommend_courses_fallback(career_goal: str, num_courses: int = 9, school_filters: Optional[List[str]] = None) -> List[Dict]:
    """
    Fallback recommendation using simple keyword matching
    More aggressive to handle typos and find ANY relevant courses
    """
    # Filter courses by school if specified
    filtered_courses = COURSE_LIST
    if school_filters and len(school_filters) > 0:
        filtered_courses = [c for c in COURSE_LIST if c['school'] in school_filters]
    
    career_lower = career_goal.lower()
    keywords = generate_career_keywords(career_goal)
    
    # Add individual words from career goal as keywords
    career_words = career_goal.lower().split()
    keywords.extend([w for w in career_words if len(w) > 3])
    
    # Score each course
    scored_courses = []
    
    for course in filtered_courses:
        score = 0
        course_text = f"{course['code']} {course['name']}".lower()
        
        # Check keyword matches
        for keyword in keywords:
            if keyword.lower() in course_text:
                score += 1
        
        # Give ANY match a minimum score so we return something
        if score > 0:
            scored_courses.append((score, course))
    
    # If still nothing found, just return some intro courses
    if len(scored_courses) == 0:
        print(f"⚠️  No keyword matches for '{career_goal}', returning intro courses")
        for course in filtered_courses[:num_courses * 2]:
            # Look for intro/101 courses
            if 'introduction' in course['name'].lower() or '101' in course['code']:
                scored_courses.append((0.1, course))
    
    # Sort by score
    scored_courses.sort(reverse=True, key=lambda x: x[0])
    
    # Get top courses
    recommended = []
    school_counts = {}
    max_per_school = 3 if not school_filters or len(school_filters) > 1 else num_courses
    
    for score, course in scored_courses:
        if len(recommended) >= num_courses:
            break
        
        school = course['school']
        if school_counts.get(school, 0) >= max_per_school:
            continue
        
        relevance = generate_relevance_explanation(career_goal, course, score / 10)
        skills = extract_skills_from_course(course['name'], career_goal)
        
        recommended.append({
            'code': course['code'],
            'relevance': relevance,
            'skills_taught': skills,
            'match_score': max(score / 10, 0.1),
            'name': course['name'],
            'school': school
        })
        
        school_counts[school] = school_counts.get(school, 0) + 1
    
    return recommended


def generate_relevance_explanation(career_goal: str, course: Dict, score: float) -> str:
    """Generate human-readable relevance explanation - UNIVERSAL for all fields"""
    course_name = course['name'].lower()
    career_lower = career_goal.lower()
    
    # Technology & CS
    if 'machine learning' in course_name or 'artificial intelligence' in course_name:
        return f"Essential for {career_goal} - covers core AI/ML concepts"
    elif 'data' in course_name and any(word in career_lower for word in ['data', 'analyst', 'science']):
        return f"Teaches data analysis skills critical for {career_goal}"
    elif 'algorithm' in course_name:
        return f"Fundamental algorithmic knowledge needed for {career_goal}"
    elif 'programming' in course_name or 'software' in course_name:
        return f"Builds programming foundation essential for {career_goal}"
    elif 'network' in course_name and 'network' in career_lower:
        return f"Provides networking expertise required for {career_goal}"
    elif 'security' in course_name and ('security' in career_lower or 'cyber' in career_lower):
        return f"Core security concepts vital for {career_goal}"
    elif 'database' in course_name:
        return f"Database skills frequently used in {career_goal}"
    elif 'web' in course_name and 'web' in career_lower:
        return f"Web development techniques applicable to {career_goal}"
    
    # Sciences
    elif 'biology' in course_name or 'biological' in course_name:
        return f"Core biological concepts essential for {career_goal}"
    elif 'chemistry' in course_name or 'chemical' in course_name:
        return f"Chemical principles fundamental to {career_goal}"
    elif 'physics' in course_name or 'physical' in course_name:
        return f"Physical science foundation important for {career_goal}"
    elif 'neuroscience' in course_name or 'brain' in course_name:
        return f"Neuroscience knowledge relevant to {career_goal}"
    elif 'laboratory' in course_name or 'lab' in course_name:
        return f"Hands-on laboratory skills crucial for {career_goal}"
    elif 'research methods' in course_name:
        return f"Research methodology essential for {career_goal}"
    
    # Social Sciences
    elif 'psychology' in course_name or 'psychological' in course_name:
        return f"Psychological understanding important for {career_goal}"
    elif 'sociology' in course_name or 'social' in course_name:
        return f"Social dynamics knowledge relevant to {career_goal}"
    elif 'anthropology' in course_name or 'cultural' in course_name:
        return f"Cultural understanding beneficial for {career_goal}"
    elif 'political' in course_name or 'policy' in course_name:
        return f"Policy and governance concepts applicable to {career_goal}"
    
    # Business & Economics
    elif 'business' in course_name or 'management' in course_name:
        return f"Business fundamentals essential for {career_goal}"
    elif 'finance' in course_name or 'financial' in course_name:
        return f"Financial knowledge critical for {career_goal}"
    elif 'economics' in course_name or 'economic' in course_name:
        return f"Economic principles important for {career_goal}"
    elif 'marketing' in course_name:
        return f"Marketing concepts relevant to {career_goal}"
    elif 'accounting' in course_name:
        return f"Accounting skills valuable for {career_goal}"
    elif 'entrepreneur' in course_name:
        return f"Entrepreneurial thinking applicable to {career_goal}"
    
    # Arts & Humanities
    elif 'art' in course_name and 'art' in career_lower:
        return f"Artistic techniques and concepts for {career_goal}"
    elif 'design' in course_name:
        return f"Design principles essential for {career_goal}"
    elif 'music' in course_name:
        return f"Musical knowledge and skills for {career_goal}"
    elif 'theater' in course_name or 'drama' in course_name:
        return f"Performance and theatrical skills for {career_goal}"
    elif 'film' in course_name or 'cinema' in course_name:
        return f"Film and media production skills for {career_goal}"
    elif 'writing' in course_name:
        return f"Writing skills essential for {career_goal}"
    elif 'literature' in course_name:
        return f"Literary analysis relevant to {career_goal}"
    elif 'history' in course_name or 'historical' in course_name:
        return f"Historical context important for {career_goal}"
    elif 'philosophy' in course_name:
        return f"Critical thinking and reasoning for {career_goal}"
    
    # Communications & Media
    elif 'communication' in course_name:
        return f"Communication skills vital for {career_goal}"
    elif 'journalism' in course_name:
        return f"Journalistic skills applicable to {career_goal}"
    elif 'media' in course_name:
        return f"Media literacy and production for {career_goal}"
    elif 'public relations' in course_name:
        return f"PR and communication strategies for {career_goal}"
    
    # Education
    elif 'education' in course_name or 'teaching' in course_name:
        return f"Pedagogical methods relevant to {career_goal}"
    
    # Health & Medicine
    elif 'medical' in course_name or 'medicine' in course_name:
        return f"Medical knowledge essential for {career_goal}"
    elif 'health' in course_name:
        return f"Health sciences relevant to {career_goal}"
    elif 'nursing' in course_name:
        return f"Patient care skills for {career_goal}"
    
    # Law
    elif 'law' in course_name or 'legal' in course_name:
        return f"Legal knowledge applicable to {career_goal}"
    
    # Mathematics & Statistics
    elif 'mathematics' in course_name or 'calculus' in course_name:
        return f"Mathematical foundation important for {career_goal}"
    elif 'statistics' in course_name or 'statistical' in course_name:
        return f"Statistical analysis skills for {career_goal}"
    
    # Generic fallback
    else:
        return f"Relevant knowledge and skills for {career_goal}"


def extract_skills_from_course(course_name: str, career_goal: str) -> List[str]:
    """Extract skills taught based on course name"""
    course_lower = course_name.lower()
    skills = []
    
    skill_keywords = {
        'programming': ['Programming', 'Coding', 'Software Development'],
        'algorithm': ['Algorithms', 'Problem-solving', 'Computational Thinking'],
        'data': ['Data Analysis', 'Data Processing', 'Data Management'],
        'machine learning': ['Machine Learning', 'AI', 'Model Training'],
        'network': ['Networking', 'Protocols', 'Communication'],
        'security': ['Security', 'Cryptography', 'Risk Management'],
        'database': ['Database Design', 'SQL', 'Data Modeling'],
        'web': ['Web Development', 'Frontend', 'Backend'],
        'statistics': ['Statistics', 'Probability', 'Data Analysis'],
        'software engineering': ['Software Design', 'Testing', 'Architecture'],
        'computer graphics': ['Graphics', 'Visualization', '3D Modeling'],
        'artificial intelligence': ['AI', 'Machine Learning', 'Neural Networks'],
        'research': ['Research Methods', 'Analysis', 'Critical Thinking'],
        'writing': ['Writing', 'Communication', 'Composition'],
        'literature': ['Literary Analysis', 'Critical Reading', 'Interpretation'],
        'history': ['Historical Analysis', 'Research', 'Contextualization'],
        'psychology': ['Psychological Theory', 'Behavior Analysis', 'Research Methods'],
        'biology': ['Biological Concepts', 'Lab Skills', 'Scientific Method'],
        'chemistry': ['Chemical Principles', 'Lab Techniques', 'Analysis'],
        'physics': ['Physical Principles', 'Mathematical Modeling', 'Experimentation'],
        'economics': ['Economic Theory', 'Analysis', 'Quantitative Methods'],
        'business': ['Business Strategy', 'Management', 'Analysis'],
        'marketing': ['Marketing Principles', 'Consumer Behavior', 'Strategy'],
        'finance': ['Financial Analysis', 'Accounting', 'Investment'],
        'art': ['Artistic Technique', 'Creative Expression', 'Visual Literacy'],
        'design': ['Design Principles', 'Creative Problem-solving', 'Visual Communication'],
        'music': ['Musical Theory', 'Performance', 'Composition'],
        'philosophy': ['Critical Thinking', 'Logical Reasoning', 'Ethics'],
        'anthropology': ['Cultural Analysis', 'Research Methods', 'Ethnography'],
        'sociology': ['Social Theory', 'Research Methods', 'Statistical Analysis'],
        'political': ['Political Theory', 'Policy Analysis', 'Research'],
        'communication': ['Communication Theory', 'Public Speaking', 'Media'],
        'education': ['Pedagogy', 'Learning Theory', 'Instruction'],
        'law': ['Legal Analysis', 'Reasoning', 'Research'],
        'management': ['Leadership', 'Strategy', 'Organization'],
    }
    
    for keyword, skill_list in skill_keywords.items():
        if keyword in course_lower:
            skills.extend(skill_list[:2])
    
    # Add generic skills if none found
    if not skills:
        skills = ['Critical Thinking', 'Analysis', 'Problem-solving']
    
    return skills[:4]


def generate_career_analysis(career_goal: str, school_filters: Optional[List[str]] = None) -> str:
    """Generate field-appropriate career analysis"""
    career_lower = career_goal.lower()
    school_context = ""
    if school_filters:
        school_context = f" from {', '.join(school_filters)}"
    
    # Technology & Engineering
    if any(word in career_lower for word in ['software', 'engineer', 'developer', 'programming', 'computer', 'tech', 'ai', 'machine learning', 'data science']):
        return f"{career_goal} requires strong technical skills and problem-solving abilities. These courses{school_context} will build your foundation in programming, algorithms, and system design."
    
    # Sciences
    elif any(word in career_lower for word in ['biology', 'chemistry', 'physics', 'neuroscience', 'environmental', 'science', 'research', 'laboratory']):
        return f"{career_goal} demands rigorous scientific training and analytical thinking. These courses{school_context} will develop your research skills, laboratory techniques, and scientific methodology."
    
    # Health & Medicine
    elif any(word in career_lower for word in ['medical', 'health', 'nursing', 'doctor', 'physician', 'clinical', 'patient']):
        return f"{career_goal} requires comprehensive medical knowledge and patient care skills. These courses{school_context} will prepare you with essential clinical competencies and healthcare understanding."
    
    # Social Sciences
    elif any(word in career_lower for word in ['psychology', 'sociology', 'anthropology', 'social', 'counseling', 'therapy']):
        return f"{career_goal} involves understanding human behavior and social systems. These courses{school_context} will equip you with research methods, theoretical frameworks, and analytical skills."
    
    # Business & Economics
    elif any(word in career_lower for word in ['business', 'finance', 'accounting', 'marketing', 'management', 'economics', 'entrepreneur', 'consulting']):
        return f"{career_goal} demands strong analytical and strategic thinking abilities. These courses{school_context} will develop your business acumen, financial literacy, and leadership skills."
    
    # Arts & Humanities
    elif any(word in career_lower for word in ['art', 'design', 'music', 'theater', 'film', 'creative', 'artist', 'performer']):
        return f"{career_goal} requires creative vision and technical mastery. These courses{school_context} will nurture your artistic abilities, creative expression, and technical skills."
    
    # Writing & Literature
    elif any(word in career_lower for word in ['writing', 'author', 'journalist', 'editor', 'literature', 'english', 'publishing']):
        return f"{career_goal} demands strong writing skills and literary understanding. These courses{school_context} will refine your writing craft, critical analysis, and communication abilities."
    
    # Communications & Media
    elif any(word in career_lower for word in ['communication', 'media', 'journalism', 'public relations', 'advertising', 'broadcasting']):
        return f"{career_goal} requires excellent communication and media skills. These courses{school_context} will develop your storytelling abilities, media literacy, and strategic communication."
    
    # Education
    elif any(word in career_lower for word in ['teacher', 'teaching', 'education', 'instructor', 'professor']):
        return f"{career_goal} involves facilitating learning and student development. These courses{school_context} will prepare you with pedagogical methods, curriculum design, and educational theory."
    
    # Law & Policy
    elif any(word in career_lower for word in ['law', 'legal', 'attorney', 'policy', 'political', 'government']):
        return f"{career_goal} requires strong analytical reasoning and research skills. These courses{school_context} will develop your legal thinking, policy analysis, and argumentative abilities."
    
    # History & Philosophy
    elif any(word in career_lower for word in ['history', 'historian', 'philosophy', 'philosopher']):
        return f"{career_goal} demands critical thinking and deep analytical skills. These courses{school_context} will strengthen your research abilities, analytical reasoning, and contextual understanding."
    
    # Universal fallback
    else:
        return f"{career_goal} requires a solid academic foundation and specialized knowledge. These courses{school_context} will prepare you with essential skills and theoretical understanding for your career path."


def generate_additional_advice(career_goal: str) -> str:
    """Generate field-appropriate additional advice"""
    career_lower = career_goal.lower()
    
    # Technology & Engineering
    if any(word in career_lower for word in ['software', 'engineer', 'developer', 'programming', 'computer', 'tech', 'ai', 'data']):
        return f"Build a strong portfolio with personal projects and contribute to open source. Seek internships and attend hackathons to gain practical experience. Stay current with emerging technologies."
    
    # Sciences & Research
    elif any(word in career_lower for word in ['biology', 'chemistry', 'physics', 'research', 'science', 'laboratory', 'neuroscience']):
        return f"Gain hands-on laboratory experience and consider research assistant positions. Attend academic conferences and seminars. Build relationships with faculty mentors in your field."
    
    # Health & Medicine
    elif any(word in career_lower for word in ['medical', 'health', 'nursing', 'doctor', 'clinical', 'patient']):
        return f"Seek clinical shadowing and volunteer opportunities in healthcare settings. Build strong relationships with healthcare professionals. Consider research or clinical assistant positions."
    
    # Arts & Creative
    elif any(word in career_lower for word in ['art', 'design', 'music', 'creative', 'artist', 'film', 'theater']):
        return f"Build a compelling portfolio showcasing your best work. Seek exhibition or performance opportunities. Network with professionals and attend industry events in your field."
    
    # Business & Economics
    elif any(word in career_lower for word in ['business', 'finance', 'marketing', 'management', 'entrepreneur', 'consulting']):
        return f"Pursue relevant internships and case competitions. Join business clubs and networking events. Develop both analytical and interpersonal skills through real-world projects."
    
    # Social Sciences
    elif any(word in career_lower for word in ['psychology', 'sociology', 'anthropology', 'social', 'counseling']):
        return f"Gain research experience through faculty projects or independent studies. Seek volunteer or practicum opportunities. Attend conferences and present research when possible."
    
    # Communications & Media
    elif any(word in career_lower for word in ['journalism', 'media', 'communication', 'public relations', 'advertising']):
        return f"Build a portfolio of published work or media projects. Seek internships at media organizations. Network with professionals and stay current with industry trends."
    
    # Education
    elif any(word in career_lower for word in ['teacher', 'teaching', 'education']):
        return f"Gain classroom experience through student teaching and tutoring. Observe experienced educators. Join education-focused student organizations and attend professional development workshops."
    
    # Law & Policy
    elif any(word in career_lower for word in ['law', 'legal', 'policy', 'political']):
        return f"Seek internships at law firms, government agencies, or policy organizations. Join debate or mock trial teams. Build strong research and writing skills through challenging coursework."
    
    # Universal fallback
    else:
        return f"Gain practical experience through internships, volunteer work, or research opportunities. Build relationships with mentors in your field. Join relevant student organizations and attend professional events."


@router.post("/smart-recommend", response_model=RecommendationResponse)
async def smart_recommend_courses(request: CareerRecommendationRequest):
    """
    Smart course recommendation endpoint
    NOW WITH SCHOOL FILTERING!
    """
    try:
        # Validate school filters if provided
        if request.school_filters:
            invalid_schools = [s for s in request.school_filters if s not in AVAILABLE_SCHOOLS]
            if invalid_schools:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid schools: {', '.join(invalid_schools)}. Available schools: {', '.join(AVAILABLE_SCHOOLS)}"
                )
        
        # Get recommended courses
        recommended_courses = recommend_courses_smart(
            request.career_goal,
            request.num_recommendations,
            request.school_filters  # Pass school filters
        )
        
        if not recommended_courses:
            school_msg = f" in schools: {', '.join(request.school_filters)}" if request.school_filters else ""
            raise HTTPException(
                status_code=404,
                detail=f"No relevant courses found for '{request.career_goal}'{school_msg}. Try different filters or career goal."
            )
        
        # Extract required skills
        required_skills = extract_skills_from_career(request.career_goal)
        
        # Calculate skill coverage
        skill_coverage = min(85, 60 + len(recommended_courses) * 3)
        
        # Generate universal career analysis based on field
        career_analysis = generate_career_analysis(request.career_goal, request.school_filters)
        
        # Generate additional advice
        additional_advice = generate_additional_advice(request.career_goal)
        
        return RecommendationResponse(
            career_analysis=career_analysis,
            required_skills=required_skills,
            recommended_courses=recommended_courses,
            skill_coverage_percentage=skill_coverage,
            additional_advice=additional_advice
        )
        
    except HTTPException:
        # Re-raise HTTPExceptions as-is (404, 400, etc.)
        raise
    except Exception as e:
        print(f"Error in smart_recommend_courses: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schools")
async def get_available_schools():
    """Get list of all available schools"""
    if not AVAILABLE_SCHOOLS:
        return {"error": "Course data not loaded", "schools": []}
    
    # Get course count per school
    school_counts = {}
    for course in COURSE_LIST:
        school = course['school']
        school_counts[school] = school_counts.get(school, 0) + 1
    
    schools_with_counts = [
        {"code": school, "name": school, "course_count": school_counts.get(school, 0)}
        for school in AVAILABLE_SCHOOLS
    ]
    
    return {
        "schools": schools_with_counts,
        "total_schools": len(AVAILABLE_SCHOOLS)
    }


@router.get("/stats")
async def get_course_stats():
    """Get statistics about loaded courses"""
    if not COURSES_DATA:
        return {"error": "Course data not loaded", "courses_loaded": 0}
    
    return {
        "total_schools": COURSES_DATA['metadata']['total_schools'],
        "total_courses": COURSES_DATA['metadata']['total_courses'],
        "courses_loaded": len(COURSE_LIST),
        "available_schools": AVAILABLE_SCHOOLS
    }