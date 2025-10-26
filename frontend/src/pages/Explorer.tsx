import { useState, useEffect } from 'react'
import { coursesService } from '../services/courses'
import CourseCard from '../components/CourseCard'
import CourseDetailModal from '../components/CourseDetailModal'

interface Course {
  id: string
  code: string
  title: string
  short_title: string
  description: string
  credits: number
  level: string
  school?: string
  subject?: string
  prerequisites: {
    required: string[]
    recommended: string[]
  }
  hub_requirements: string[]
}

interface School {
  abbreviation: string
  full_name: string
  label: string
}

interface Department {
  code: string
  name: string
  label: string
}

export default function Explorer() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('All')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  
  const [selectedCollege, setSelectedCollege] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  
  const [tempCollege, setTempCollege] = useState('')
  const [tempDepartment, setTempDepartment] = useState('')
  const [tempLevel, setTempLevel] = useState('All')

  useEffect(() => {
    loadCourses()
    loadSchools()
  }, [])

  useEffect(() => {
    if (tempCollege) {
      loadDepartmentsBySchool(tempCollege)
      setTempDepartment('')
    } else {
      setDepartments([])
      setTempDepartment('')
    }
  }, [tempCollege])

  const loadCourses = async () => {
    try {
      const data = await coursesService.getAllCourses()
      setCourses(data.courses)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSchools = async () => {
    try {
      const data = await coursesService.getSchools()
      setSchools(data.schools)
    } catch (error) {
      console.error('Error loading schools:', error)
    }
  }



  const loadDepartmentsBySchool = async (school: string) => {
    try {
      const data = await coursesService.getDepartmentsBySchool(school)
      setDepartments(data.departments)
    } catch (error) {
      console.error('Error loading departments by school:', error)
    }
  }

  const handleApplyFilters = () => {
    setSelectedCollege(tempCollege)
    setSelectedDepartment(tempDepartment)
    setSelectedLevel(tempLevel)
  }

  const handleResetFilters = () => {
    setTempCollege('')
    setTempDepartment('')
    setTempLevel('All')
    setSelectedCollege('')
    setSelectedDepartment('')
    setSelectedLevel('All')
    setDepartments([])
  }

  const filteredCourses = courses.filter(course => {
    // Filter out invalid courses
    if (!course.code || !course.title || course.title === '0' || course.title === 0) {
      return false
    }
    
    const matchesSearch = searchQuery === '' || 
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel
    
    const matchesCollege = selectedCollege === '' || course.school === selectedCollege
    
    const matchesDepartment = selectedDepartment === '' || course.subject === selectedDepartment

    return matchesSearch && matchesLevel && matchesCollege && matchesDepartment
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading courses...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Course Explorer</h1>
      <p className="text-gray-600 mb-8">Browse and search courses from all BU schools</p>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Courses
          </label>
          <input
            type="text"
            placeholder="Search by code, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* College Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College
            </label>
            <select
              value={tempCollege}
              onChange={(e) => setTempCollege(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Colleges</option>
              {schools.map(school => (
                <option key={school.abbreviation} value={school.abbreviation}>
                  {school.label}
                </option>
              ))}
            </select>
          </div>

          {/* Department/Major Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department/Major
            </label>
            <select
              value={tempDepartment}
              onChange={(e) => setTempDepartment(e.target.value)}
              disabled={!tempCollege}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                !tempCollege ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.code} value={dept.code}>
                  {dept.code}
                </option>
              ))}
            </select>
            {!tempCollege && (
              <p className="text-xs text-gray-500 mt-1">Select a college first</p>
            )}
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select
              value={tempLevel}
              onChange={(e) => setTempLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="All">All Levels</option>
              <option value="Introductory">Introductory</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>
        </div>

        {/* Filter Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Reset Filters
          </button>
        </div>

        {/* Active Filters Display */}
        {(selectedCollege || selectedDepartment || selectedLevel !== 'All') && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600">Active filters:</span>
            {selectedCollege && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                {schools.find(s => s.abbreviation === selectedCollege)?.label}
              </span>
            )}
            {selectedDepartment && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {selectedDepartment}
              </span>
            )}
            {selectedLevel !== 'All' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                {selectedLevel}
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course}
            onClick={() => setSelectedCourse(course)}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No courses found matching your criteria.</p>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          allCourses={courses}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  )
}
