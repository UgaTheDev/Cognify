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
  prerequisites: {
    required: string[]
    recommended: string[]
  }
  hub_requirements: string[]
}

export default function Explorer() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('All')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel

    return matchesSearch && matchesLevel
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
      <p className="text-gray-600 mb-8">Browse and search Computer Science courses</p>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
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

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
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
