import json
from pathlib import Path

# Load courses
json_path = Path("processing_csv/output/all_courses_data.json")
if not json_path.exists():
    json_path = Path("processing_csv/all_courses_data.json")

with open(json_path, 'r') as f:
    data = json.load(f)

# Get sample courses
all_courses = []
if 'schools' in data:
    for school_name, school_data in data['schools'].items():
        for course in school_data.get('courses', [])[:2]:  # 2 per school
            course_with_school = course.copy()
            course_with_school['school'] = school_name
            all_courses.append(course_with_school)

print(f"Total courses: {len(all_courses)}")
print("\nSample courses:")
for course in all_courses[:5]:
    code = course.get('code', '')
    code_parts = code.split()
    print(f"\nOriginal code: {code}")
    print(f"  Parts: {code_parts}")
    if len(code_parts) >= 3:
        print(f"  School (part 0): {code_parts[0]}")
        print(f"  Subject (part 1): {code_parts[1]}")
        print(f"  Number (part 2): {code_parts[2]}")
    print(f"  course['school']: {course.get('school')}")
