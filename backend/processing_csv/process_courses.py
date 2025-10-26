import pandas as pd
import numpy as np
import os
import json
from datetime import datetime
from glob import glob

class MultiSchoolCourseProcessor:
    def __init__(self, data_directory=".", output_dir="output"):
        self.data_directory = data_directory
        self.output_dir = output_dir
        self.all_schools_data = {}
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
    
    def find_school_files(self):
        """Find all school course files in the directory"""
        pattern = os.path.join(self.data_directory, "*_all_courses.csv")
        school_files = glob(pattern)
        print(f"📁 Found {len(school_files)} school files:")
        for file in school_files:
            print(f"   {os.path.basename(file)}")
        return school_files
    
    def load_school_data(self, file_path):
        """Load course data for a single school"""
        try:
            school_name = os.path.basename(file_path).replace('_all_courses.csv', '').upper()
            print(f"\n📁 Loading {school_name} courses from {os.path.basename(file_path)}")
            
            df = pd.read_csv(file_path)
            print(f"✅ Successfully loaded {len(df)} {school_name} courses")
            
            return school_name, df
        except Exception as e:
            print(f"❌ Error loading {file_path}: {e}")
            return None, None
    
    def process_school_data(self, school_name, df):
        """Process and analyze data for a single school"""
        # Identify HUB columns
        hub_columns = [col for col in df.columns if col not in ['code', 'name']]
        
        # Calculate statistics
        hub_counts = {}
        for hub in hub_columns:
            count = df[hub].sum()
            hub_counts[hub] = int(count)
        
        # Courses per HUB count
        df['hub_count'] = df[hub_columns].sum(axis=1)
        hub_distribution = df['hub_count'].value_counts().sort_index().to_dict()
        
        # Convert to dictionary for JSON
        courses_data = []
        for _, row in df.iterrows():
            course_info = {
                'code': row['code'],
                'name': row['name'],
                'hub_areas': {}
            }
            
            # Add HUB areas that this course fulfills
            for hub in hub_columns:
                if row[hub] == 1:
                    course_info['hub_areas'][hub] = True
            
            courses_data.append(course_info)
        
        school_data = {
            'school': school_name,
            'total_courses': len(df),
            'total_hub_areas': len(hub_columns),
            'hub_statistics': {
                'courses_per_area': hub_counts,
                'distribution': hub_distribution,
                'average_hubs_per_course': round(df['hub_count'].mean(), 2)
            },
            'courses': courses_data
        }
        
        return school_data
    
    def find_courses_by_hub(self, hub_areas, school_filter=None):
        """Find courses across all schools that fulfill specific HUB requirements"""
        print(f"\n🔍 Searching for courses fulfilling: {', '.join(hub_areas)}")
        if school_filter:
            print(f"   Filter: {school_filter}")
        
        matching_courses = []
        
        for school_name, school_data in self.all_schools_data.items():
            if school_filter and school_name != school_filter:
                continue
                
            for course in school_data['courses']:
                # Check if course fulfills ALL specified HUB areas
                fulfills_all = all(course['hub_areas'].get(hub, False) for hub in hub_areas)
                if fulfills_all:
                    matching_courses.append({
                        'school': school_name,
                        'code': course['code'],
                        'name': course['name'],
                        'hub_areas': list(course['hub_areas'].keys())
                    })
        
        print(f"✅ Found {len(matching_courses)} courses:")
        for course in matching_courses[:10]:  # Show first 10
            print(f"   {course['school']} {course['code']}: {course['name']}")
        if len(matching_courses) > 10:
            print(f"   ... and {len(matching_courses) - 10} more")
        
        return matching_courses
    
    def generate_school_summary(self):
        """Generate summary statistics across all schools"""
        print("\n" + "="*60)
        print("🏫 MULTI-SCHOOL SUMMARY")
        print("="*60)
        
        summary = {
            'timestamp': datetime.now().isoformat(),
            'total_schools': len(self.all_schools_data),
            'schools': {}
        }
        
        total_courses = 0
        all_hub_areas = set()
        
        for school_name, school_data in self.all_schools_data.items():
            summary['schools'][school_name] = {
                'total_courses': school_data['total_courses'],
                'total_hub_areas': school_data['total_hub_areas'],
                'average_hubs_per_course': school_data['hub_statistics']['average_hubs_per_course']
            }
            total_courses += school_data['total_courses']
            
            # Collect all unique HUB areas
            for hub_area in school_data['hub_statistics']['courses_per_area'].keys():
                all_hub_areas.add(hub_area)
        
        summary['total_courses'] = total_courses
        summary['unique_hub_areas'] = list(all_hub_areas)
        summary['total_unique_hub_areas'] = len(all_hub_areas)
        
        # Print summary
        print(f"📊 Total schools: {summary['total_schools']}")
        print(f"📚 Total courses: {summary['total_courses']:,}")
        print(f"🎯 Unique HUB areas: {summary['total_unique_hub_areas']}")
        print(f"\n🏫 School breakdown:")
        for school, stats in summary['schools'].items():
            print(f"   {school}: {stats['total_courses']} courses, {stats['average_hubs_per_course']} avg HUBs/course")
        
        return summary
    
    def save_as_json(self, filename="all_courses_data.json"):
        """Save all data as JSON"""
        output_data = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'total_schools': len(self.all_schools_data),
                'total_courses': sum(school['total_courses'] for school in self.all_schools_data.values())
            },
            'schools': self.all_schools_data
        }
        
        output_path = os.path.join(self.output_dir, filename)
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Saved JSON data to: {output_path}")
            print(f"📁 File size: {os.path.getsize(output_path) / 1024**2:.2f} MB")
            return True
        except Exception as e:
            print(f"❌ Error saving JSON: {e}")
            return False
    
    def run_full_processing(self):
        """Run the complete multi-school processing pipeline"""
        print("🎯 MULTI-SCHOOL COURSE HUB ANALYZER")
        print("=" * 60)
        
        # Find all school files
        school_files = self.find_school_files()
        if not school_files:
            print("❌ No school files found!")
            return False
        
        # Process each school
        for file_path in school_files:
            school_name, df = self.load_school_data(file_path)
            if school_name and df is not None:
                school_data = self.process_school_data(school_name, df)
                self.all_schools_data[school_name] = school_data
        
        if not self.all_schools_data:
            print("❌ No school data processed successfully!")
            return False
        
        # Generate summaries
        self.generate_school_summary()
        
        # Example searches
        print("\n" + "="*60)
        print("🔍 EXAMPLE HUB SEARCHES")
        print("="*60)
        
        # Get some common HUB areas from the first school
        first_school = next(iter(self.all_schools_data.values()))
        hub_areas = list(first_school['hub_statistics']['courses_per_area'].keys())[:2]
        if hub_areas:
            self.find_courses_by_hub(hub_areas)
        
        # Save as JSON
        self.save_as_json()
        
        print("\n" + "=" * 60)
        print("✅ MULTI-SCHOOL PROCESSING COMPLETE!")
        print("=" * 60)
        
        return True


def main():
    """Main function to run the multi-school processor"""
    # Create processor instance
    processor = MultiSchoolCourseProcessor(data_directory=".", output_dir="output")
    
    # Run full processing pipeline
    success = processor.run_full_processing()
    
    if success:
        print("\n🎉 All schools processed successfully!")
        print("\n💡 You can now search for courses like this:")
        print("   processor.find_courses_by_hub(['Philosophical Inquiry', 'Aesthetic Exploration'])")
        print("   processor.find_courses_by_hub(['Scientific Inquiry'], school_filter='CAS')")
        print("\n📁 JSON output saved in 'output/all_courses_data.json'")
    else:
        print("\n❌ Processing failed. Please check the errors above.")


if __name__ == "__main__":
    main()