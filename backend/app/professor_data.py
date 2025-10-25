import pandas as pd
from typing import List, Dict, Optional
import os

# Load professor data
PROFESSORS_FILE = os.path.join(os.path.dirname(__file__), '../data/openalex_dict_vHack.xlsx')

def load_professors() -> pd.DataFrame:
    """Load professor data from Excel file"""
    try:
        df = pd.read_excel(PROFESSORS_FILE)
        # Fill NaN values with empty strings to avoid errors
        df = df.fillna('')
        return df
    except Exception as e:
        print(f"Error loading professors: {e}")
        return pd.DataFrame()

def get_professors_by_department(department: str) -> List[Dict]:
    """Get all professors in a department"""
    df = load_professors()
    
    if df.empty:
        return []
    
    # Search in both primary and joint departments
    # Convert to string first to avoid issues with NaN
    df['primary_department'] = df['primary_department'].astype(str)
    df['joint_department'] = df['joint_department'].astype(str)
    
    matches = df[
        (df['primary_department'].str.contains(department, case=False, na=False)) |
        (df['joint_department'].str.contains(department, case=False, na=False))
    ]
    
    # Convert to dict and clean up
    result = matches.to_dict('records')
    return result

def get_professor_by_name(name: str) -> Optional[Dict]:
    """Get professor by name"""
    df = load_professors()
    
    if df.empty:
        return None
    
    df['emp_name'] = df['emp_name'].astype(str)
    matches = df[df['emp_name'].str.contains(name, case=False, na=False)]
    
    if len(matches) > 0:
        return matches.iloc[0].to_dict()
    return None

def get_all_cs_professors() -> List[Dict]:
    """Get all Computer Science professors"""
    return get_professors_by_department('Computer Science')
