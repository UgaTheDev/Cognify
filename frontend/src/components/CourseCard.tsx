import { BookOpen, Clock, Award, CheckCircle } from 'lucide-react'

interface Course {
  id: string
  code: string
  title: string
  description: string
  credits: number
  level: string
  prerequisites: {
    required: string[]
    recommended: string[]
  }
  hub_requirements: string[]
}

interface CourseCardProps {
  course: Course
  onClick?: () => void
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Introductory': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-blue-100 text-blue-800'
      case 'Advanced': return 'bg-purple-100 text-purple-800'
      case 'Graduate': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-6 cursor-pointer border-l-4 border-red-600 hover:scale-105"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{course.code}</h3>
          <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Clock size={16} className="mr-1" />
          {course.credits} credits
        </div>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
        {course.title}
      </h4>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {course.description}
      </p>

      {/* Hub Requirements */}
      {course.hub_requirements.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {course.hub_requirements.map((hub) => (
            <span 
              key={hub}
              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
            >
              {hub}
            </span>
          ))}
        </div>
      )}

      {/* Prerequisites */}
      {course.prerequisites.required.length > 0 && (
        <div className="flex items-start text-sm text-gray-500 border-t pt-3">
          <BookOpen size={14} className="mr-1 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            Prereq: {course.prerequisites.required.join(', ')}
          </span>
        </div>
      )}

      {course.prerequisites.required.length === 0 && (
        <div className="flex items-center text-sm text-green-600 border-t pt-3">
          <CheckCircle size={14} className="mr-1" />
          <span>No prerequisites</span>
        </div>
      )}
    </div>
  )
}
