# backend/processing_csv/process_courses.py
import pandas as pd
import numpy as np
from typing import List, Dict, Any
import json
import re
import os
from pathlib import Path
from datetime import datetime

class CourseDataProcessor:
    def __init__(self, csv_file_path: str):
        self.csv_file_path = csv_file_path
        self.df = None
        self.processed_courses = []
        
    def load_and_parse_csv(self) -> bool:
        """Load and parse the CSV file with proper formatting"""
        try:
            print(f"📁 Loading data from {self.csv_file_path}...")
            
            # Read the first few lines to understand the structure
            with open(self.csv_file_path, 'r', encoding='utf-8') as f:
                first_lines = [f.readline() for _ in range(5)]
            
            print("🔍 File structure analysis:")
            for i, line in enumerate(first_lines):
                print(f"   Line {i}: {line.strip()}")
            
            # The data starts from line 2 (index 1) since line 0 is the weird header
            # and line 1 is the actual column headers
            self.df = pd.read_csv(self.csv_file_path, 
                                skiprows=1,  # Skip the first row (mv_ps_crse_offer_202510251534)
                                low_memory=False)
            
            print(f"✅ Successfully loaded {len(self.df):,} rows and {len(self.df.columns)} columns")
            print(f"📝 Actual columns: {list(self.df.columns)}")
            return True
                
        except Exception as e:
            print(f"❌ Error loading CSV file: {e}")
            return False
    
    def explore_data(self):
        """Explore the dataset structure"""
        print("\n" + "="*60)
        print("🔍 DATA EXPLORATION")
        print("="*60)
        
        if self.df is None:
            print("❌ No data loaded.")
            return
            
        print(f"📊 Dataset shape: {self.df.shape}")
        print(f"📝 Columns: {list(self.df.columns)}")
        
        # Show data types
        print("\n📋 Data Types:")
        print(self.df.dtypes)
        
        # Show sample data for key columns
        print("\n👀 Sample data for key columns:")
        key_columns = ['crse_id', 'effdt', 'subject', 'catalog_nbr', 'acad_group', 'acad_org', 'acad_career']
        for col in key_columns:
            if col in self.df.columns:
                non_null = self.df[col].notna().sum()
                sample = self.df[col].dropna().head(3).tolist()
                print(f"   {col:.<20} {non_null:>6,} non-null, sample: {sample}")
    
    def filter_recent_courses(self):
        """Filter courses from 2022 onwards based on effdt column"""
        print("\n" + "="*60)
        print("📅 FILTERING COURSES FROM 2022 ONWARDS")
        print("="*60)
        
        if 'effdt' not in self.df.columns:
            print("❌ 'effdt' column not found")
            return
        
        original_count = len(self.df)
        
        # Convert effdt to string and extract year
        self.df['effdt_str'] = self.df['effdt'].astype(str)
        
        # Extract year from effdt
        def extract_year(date_str):
            if pd.isna(date_str) or date_str in ['', 'nan', 'None', '1901-01-01 00:00:00.000']:
                return None
            
            # Try to extract year from various date formats
            year_patterns = [
                r'^(\d{4})',  # YYYY at start
                r'(\d{4})-\d{2}-\d{2}',  # YYYY-MM-DD
            ]
            
            for pattern in year_patterns:
                match = re.search(pattern, str(date_str))
                if match:
                    year = int(match.group(1))
                    return year
            
            return None
        
        self.df['effdt_year'] = self.df['effdt_str'].apply(extract_year)
        
        # Show year distribution before filtering
        year_counts = self.df['effdt_year'].value_counts().sort_index()
        print("\n📊 Year distribution in dataset:")
        for year, count in year_counts.head(20).items():
            if pd.notna(year):
                print(f"   {year}: {count:>6,} courses")
        
        # Filter for 2022 onwards
        recent_courses = self.df[self.df['effdt_year'] >= 2022]
        removed_count = len(self.df) - len(recent_courses)
        
        print(f"\n✅ Filtered to courses from 2022 onwards:")
        print(f"   Before filtering: {len(self.df):,} courses")
        print(f"   After filtering:  {len(recent_courses):,} courses")
        print(f"   Removed:          {removed_count:,} courses")
        
        # Show year distribution after filtering
        if len(recent_courses) > 0:
            recent_year_counts = recent_courses['effdt_year'].value_counts().sort_index()
            print(f"\n📈 Recent courses by year:")
            for year, count in recent_year_counts.items():
                if pd.notna(year):
                    print(f"   {year}: {count:>6,} courses")
        
        self.df = recent_courses
    
    def clean_data(self):
        """Clean and prepare the data"""
        print("\n" + "="*60)
        print("🧹 DATA CLEANING")
        print("="*60)
        
        if self.df is None or len(self.df) == 0:
            print("❌ No data to clean.")
            return
            
        original_count = len(self.df)
        
        # Filter for approved courses if column exists
        if 'course_approved' in self.df.columns:
            approved_count = (self.df['course_approved'] == 'A').sum()
            self.df = self.df[self.df['course_approved'] == 'A']
            print(f"✅ Filtered to {approved_count:,} approved courses")
        
        # Remove rows with empty catalog numbers
        if 'catalog_nbr' in self.df.columns:
            non_empty_catalog = self.df['catalog_nbr'].notna() & (self.df['catalog_nbr'] != '')
            self.df = self.df[non_empty_catalog]
            print(f"✅ Removed empty catalog numbers: {len(self.df):,} rows remaining")
        
        # Remove duplicates based on course ID
        if 'crse_id' in self.df.columns:
            initial_count = len(self.df)
            self.df = self.df.drop_duplicates(subset=['crse_id'])
            removed = initial_count - len(self.df)
            if removed > 0:
                print(f"✅ Removed {removed:,} duplicate course IDs")
        
        print(f"📊 Final dataset: {len(self.df):,} courses ({original_count - len(self.df):,} removed)")
    
    def extract_course_level(self, catalog_nbr: Any) -> str:
        """Extract course level from catalog number"""
        if pd.isna(catalog_nbr) or catalog_nbr == '':
            return "Unknown"
        
        catalog_str = str(catalog_nbr).strip()
        
        # Try to extract numeric part
        numbers = re.findall(r'\d+', catalog_str)
        if numbers:
            course_num = int(numbers[0])
            if course_num < 100:
                return "Introductory"
            elif course_num < 200:
                return "Undergraduate Lower"
            elif course_num < 300:
                return "Undergraduate Upper"
            elif course_num < 500:
                return "Advanced Undergraduate"
            else:
                return "Graduate"
        
        return "Unknown"
    
    def process_for_api(self) -> List[Dict]:
        """Process courses into API-friendly format (simplified - omitting campus, institution, description, credits, approved)"""
        print("\n" + "="*60)
        print("🚀 PROCESSING FOR API")
        print("="*60)
        
        if self.df is None or len(self.df) == 0:
            print("❌ No data to process.")
            return []
        
        processed_courses = []
        
        for index, row in self.df.iterrows():
            # Create simplified course object (omitting campus, institution, description, credits, approved)
            course = {
                # Core identifiers
                'id': str(row.get('crse_id', f'course_{index}')),
                'subject': str(row.get('subject', '')),
                'catalog_number': str(row.get('catalog_nbr', '')),
                'code': f"{row.get('subject', '')} {row.get('catalog_nbr', '')}".strip(),
                
                # Academic info
                'academic_group': str(row.get('acad_group', '')),
                'academic_org': str(row.get('acad_org', '')),
                'career_level': str(row.get('acad_career', '')),
                
                # Date information
                'effective_year': int(row.get('effdt_year', 0)) if pd.notna(row.get('effdt_year')) else None,
                
                # Derived fields
                'level': self.extract_course_level(row.get('catalog_nbr')),
                'department': str(row.get('acad_org', row.get('acad_group', ''))),
                
                # Title only (description omitted)
                'title': f"{row.get('subject', '')} {row.get('catalog_nbr', '')}"
            }
            
            processed_courses.append(course)
        
        self.processed_courses = processed_courses
        print(f"✅ Processed {len(processed_courses):,} courses for API")
        print("📋 Simplified fields: id, subject, catalog_number, code, academic_group, academic_org, career_level, effective_year, level, department, title")
        
        return processed_courses
    
    def save_processed_data(self):
        """Save processed data in multiple formats"""
        print("\n" + "="*60)
        print("💾 SAVING PROCESSED DATA")
        print("="*60)
        
        if not self.processed_courses:
            print("❌ No processed data available.")
            return
        
        # Ensure output directory exists
        output_dir = Path(__file__).parent
        output_dir.mkdir(exist_ok=True)
        
        # Save full dataset as JSON
        full_output = output_dir / 'processed_courses_2022_onwards.json'
        with open(full_output, 'w', encoding='utf-8') as f:
            json.dump(self.processed_courses, f, indent=2, ensure_ascii=False)
        print(f"✅ Full dataset saved to: {full_output}")
        
        # Save sample for testing (first 200 courses)
        sample_output = output_dir / 'processed_courses_sample.json'
        with open(sample_output, 'w', encoding='utf-8') as f:
            json.dump(self.processed_courses[:200], f, indent=2, ensure_ascii=False)
        print(f"✅ Sample dataset saved to: {sample_output}")
        
        # Save as CSV for easy viewing
        csv_output = output_dir / 'processed_courses_2022_onwards.csv'
        pd.DataFrame(self.processed_courses).to_csv(csv_output, index=False)
        print(f"✅ CSV version saved to: {csv_output}")
    
    def generate_analysis_report(self):
        """Generate a comprehensive analysis report"""
        print("\n" + "="*60)
        print("📊 ANALYSIS REPORT")
        print("="*60)
        
        if not self.processed_courses:
            print("❌ No processed courses available.")
            return
        
        analysis_df = pd.DataFrame(self.processed_courses)
        
        print("\n📅 Courses by Effective Year:")
        year_counts = analysis_df['effective_year'].value_counts().sort_index()
        for year, count in year_counts.items():
            if pd.notna(year):
                print(f"   {year}: {count:>5} courses")
        
        print("\n🏫 Courses by Academic Group:")
        group_counts = analysis_df['academic_group'].value_counts()
        for group, count in group_counts.head(10).items():
            print(f"   {group:.<25} {count:>5} courses")
        
        print("\n🎓 Courses by Career Level:")
        career_counts = analysis_df['career_level'].value_counts()
        for career, count in career_counts.items():
            print(f"   {career:.<25} {count:>5} courses")
        
        print("\n📚 Courses by Level:")
        level_counts = analysis_df['level'].value_counts()
        for level, count in level_counts.items():
            print(f"   {level:.<25} {count:>5} courses")
        
        print(f"\n📈 Total unique courses (2022+): {len(analysis_df):,}")
        print(f"🏢 Total departments: {analysis_df['department'].nunique()}")
        print(f"📖 Total subjects: {analysis_df['subject'].nunique()}")

def main():
    # Path to your CSV file
    csv_file_path = os.path.join(os.path.dirname(__file__), 'raw_data.csv')
    
    print("🎯 UNIVERSITY COURSE DATA PROCESSOR (2022+ ONLY)")
    print("=" * 60)
    
    if not os.path.exists(csv_file_path):
        print(f"❌ CSV file not found: {csv_file_path}")
        return
    
    processor = CourseDataProcessor(csv_file_path)
    
    # Step 1: Load and parse CSV
    if not processor.load_and_parse_csv():
        return
    
    # Step 2: Explore data
    processor.explore_data()
    
    # Step 3: Filter for 2022+ courses
    processor.filter_recent_courses()
    
    # Step 4: Clean data
    processor.clean_data()
    
    # Step 5: Process for API
    processor.process_for_api()
    
    # Step 6: Save processed data
    processor.save_processed_data()
    
    # Step 7: Generate report
    processor.generate_analysis_report()
    
    print(f"\n🎉 PROCESSING COMPLETE!")
    print("📁 Your processed course data (2022+) is ready in:")
    print("   - processed_courses_2022_onwards.json (full dataset)")
    print("   - processed_courses_sample.json (200 courses for testing)")
    print("   - processed_courses_2022_onwards.csv (CSV format)")
    print(f"\n🚀 You can now use these files in your AI Study Advisor!")

if __name__ == "__main__":
    main()