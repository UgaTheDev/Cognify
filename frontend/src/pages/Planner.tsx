import { useState, useEffect } from 'react'
import { coursesService } from '../services/courses'
import CourseCard from '../components/CourseCard'
import CourseDetailModal from '../components/CourseDetailModal'
import SemesterBoard from '../components/SemesterBoard'
import UniversalCareerRecommender from '../components/UniversalCareerRecommender'
import PlannerControls from '../components/PlannerControls'
import { usePlannerStore } from '../store/plannerStore'

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

export default function Planner() {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRecommender, setShowRecommender] = useState(false)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const data = await coursesService.getAllCourses()
      setAvailableCourses(data.courses)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading planner...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Semester Planner</h1>
          <p className="text-gray-600">Plan your 4-year course schedule</p>
        </div>
        <button
          onClick={() => setShowRecommender(!showRecommender)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
        >
          <span>🤖</span>
          <span>{showRecommender ? 'Hide' : 'Show'} AI Recommender</span>
        </button>
      </div>

      {/* AI Career Recommender */}
      {showRecommender && (
        <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
          <UniversalCareerRecommender 
            allCourses={availableCourses}
            onAddCourse={(course) => console.log('Add course:', course)}
          />
        </div>
      )}

      {/* Planner Controls */}
      <PlannerControls />

      {/* Semester Board */}
      <SemesterBoard />

      {/* Available Courses */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Courses</h2>
        <p className="text-gray-600 mb-6">
          Click on a course to view details and add to your plan
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course}
              onClick={() => setSelectedCourse(course)}
            />
          ))}
        </div>
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          allCourses={availableCourses}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  )
}
