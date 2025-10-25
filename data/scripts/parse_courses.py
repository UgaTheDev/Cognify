import json
import re
from typing import Dict, List

def parse_prerequisites(text: str) -> Dict[str, List[str]]:
    """Parse prerequisite text into structured format."""
    if not text or 'prerequisite' not in text.lower():
        return {"required": [], "recommended": []}
    
    # Extract prerequisite section
    prereq_match = re.search(r'prerequisite[s]?:([^.]+)', text, re.IGNORECASE)
    if not prereq_match:
        return {"required": [], "recommended": []}
    
    prereq_text = prereq_match.group(1)
    
    # Find all course codes (CS 111, CS 112, MA 242, etc.)
    pattern = r'(?:CAS\s*)?([A-Z]{2})\s*(\d{3})'
    matches = re.findall(pattern, prereq_text, re.IGNORECASE)
    
    # Format courses
    courses = [f"{dept} {num}" for dept, num in matches]
    courses = list(dict.fromkeys(courses))  # Remove duplicates
    
    # Separate required vs recommended
    required = []
    recommended = []
    
    for course in courses:
        if re.search(r'recommend.*?' + re.escape(course), text, re.IGNORECASE):
            recommended.append(course)
        else:
            required.append(course)
    
    return {"required": required, "recommended": recommended}

def parse_hub_requirements(text: str) -> List[str]:
    """Extract BU Hub requirements."""
    hub_keywords = {
        "Quantitative Reasoning II": "QR2",
        "Quantitative Reasoning I": "QR1",
        "Digital/Multimedia Expression": "DME",
        "Creativity/Innovation": "CI",
        "Critical Thinking": "CT",
        "Scientific Inquiry I": "SI1",
        "Scientific Inquiry II": "SI2"
    }
    
    found_hubs = []
    for keyword, code in hub_keywords.items():
        if keyword.lower() in text.lower():
            found_hubs.append(code)
    
    return list(set(found_hubs))

def determine_level(catalog_num: str) -> str:
    """Determine course level from catalog number."""
    num = int(catalog_num)
    if num < 200:
        return "Introductory"
    elif num < 300:
        return "Intermediate"
    elif num < 500:
        return "Advanced"
    else:
        return "Graduate"

def clean_description(text: str) -> str:
    """Remove BU Hub text and clean description."""
    # Remove "BU Hub: ..." part
    text = re.sub(r'BU Hub:.*$', '', text, flags=re.IGNORECASE)
    # Remove "Carries MCS..." part
    text = re.sub(r'Carries MCS.*?CAS\.', '', text, flags=re.IGNORECASE)
    # Remove prerequisite section for clean description
    text = re.sub(r'Prerequisite[s]?:.*?\.', '', text, flags=re.IGNORECASE)
    return text.strip()

# Example: Parse a single course
# You'll paste your TerrierGPT data here
sample_courses = [
    {
        "crse_id": "102500",
        "subject": "CASCS",
        "catalog_nbr": "111",
        "descr": "Intro Computer Science 1",
        "course_title_long": "Introduction to Computer Science 1",
        "descrlong": "The first course for computer science majors. Prerequisites: None. BU Hub: Quantitative Reasoning II, Creativity/Innovation, Critical Thinking",
        "credits": 4,
        "component": "LEC",
        "repeatable": "N",
        "consent": "N"
    }
]

print("Course data parser ready!")
print("Paste your TerrierGPT course data and run this script to convert to JSON")
