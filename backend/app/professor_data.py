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
        # Filter out professors without oaid (OpenAlex ID)
        df = df[df['oaid'].astype(str).str.strip() != '']
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

def get_all_professors() -> List[Dict]:
    """Get all professors with valid OpenAlex IDs"""
    df = load_professors()
    if df.empty:
        return []
    return df.to_dict('records')

def get_all_departments() -> List[str]:
    """Get list of all unique departments"""
    df = load_professors()
    if df.empty:
        return []
    
    # Get unique departments from both primary and joint
    primary_depts = set(df['primary_department'].astype(str).unique())
    joint_depts = set(df['joint_department'].astype(str).unique())
    
    # Combine and filter out empty strings
    all_depts = primary_depts.union(joint_depts)
    all_depts = [dept for dept in all_depts if dept and dept.strip()]
    
    return sorted(all_depts)