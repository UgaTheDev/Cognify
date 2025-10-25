import { X, BookOpen, Award, Clock, Users } from 'lucide-react'
import PrerequisiteFlow from './PrerequisiteFlow'

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

interface CourseDetailModalProps {
  course: Course
  allCourses: Course[]
  onClose: () => void
}

const HUB_NAMES: Record<string, string> = {
  'QR1': 'Quantitative Reasoning I',
  'QR2': 'Quantitative Reasoning II',
  'DME': 'Digital/Multimedia Expression',
  'CI': 'Creativity/Innovation',
  'CT': 'Critical Thinking',
  'SI1': 'Scientific Inquiry I',
  'SI2': 'Scientific Inquiry II',
  'HU': 'Historical Consciousness',
  'GC': 'Global Citizenship',
  'IC': 'Intercultural Literacy',
  'EC': 'Ethical Reasoning',
  'WC': 'Written Communication',
  'OC': 'Oral Communication',
  'RP': 'Research & Information Literacy',
  'TW': 'Teamwork/Collaboration'
}

export default function CourseDetailModal({ course, allCourses, onClose }: CourseDetailModalProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Introductory': return 'bg-green-500 text-white'
      case 'Intermediate': return 'bg-blue-500 text-white'
      case 'Advanced': return 'bg-purple-500 text-white'
      case 'Graduate': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getHubFullName = (code: string) => {
    return HUB_NAMES[code] || code
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-start gap-4 pr-12">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <BookOpen size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium opacity-90 mb-1">Computer Science Course</div>
              <h2 className="text-3xl font-bold mb-1">{course.code}</h2>
              <h3 className="text-lg font-medium opacity-95 mb-3">{course.title}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white text-red-600 px-3 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-1.5">
                  <Clock size={14} />
                  {course.credits} Credits
                </span>
                <span className={`${getLevelColor(course.level)} px-3 py-1.5 rounded-full text-sm font-bold shadow-md`}>
                  {course.level}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Description */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-red-600 rounded-full"></div>
                <h4 className="text-lg font-bold text-gray-900">Course Description</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </div>

            {/* Hub Requirements */}
            {course.hub_requirements.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="text-blue-600" size={20} />
                  <h4 className="text-lg font-bold text-gray-900">BU Hub Requirements</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.hub_requirements.map((hub) => (
                    <div
                      key={hub}
                      className="px-4 py-3 bg-white rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="font-bold text-blue-900 text-sm">{hub}</div>
                      <div className="text-blue-700 text-xs mt-0.5">{getHubFullName(hub)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites Section */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Users className="text-orange-600" size={20} />
                <h4 className="text-lg font-bold text-gray-900">Prerequisites</h4>
              </div>
              {course.prerequisites.required.length > 0 ? (
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-gray-900 mb-2 block">Required Courses:</span>
                    <div className="flex flex-wrap gap-2">
                      {course.prerequisites.required.map((prereq) => (
                        <span 
                          key={prereq}
                          className="px-3 py-1.5 bg-white text-red-700 rounded-lg font-bold border-2 border-red-200 shadow-sm text-sm hover:shadow-md transition-shadow"
                        >
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                  {course.prerequisites.recommended.length > 0 && (
                    <div>
                      <span className="font-bold text-gray-900 mb-2 block">Recommended:</span>
                      <div className="flex flex-wrap gap-2">
                        {course.prerequisites.recommended.map((prereq) => (
                          <span 
                            key={prereq}
                            className="px-3 py-1.5 bg-white text-yellow-700 rounded-lg font-bold border-2 border-yellow-200 shadow-sm text-sm"
                          >
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-sm">✓</div>
                  No prerequisites required
                </div>
              )}
            </div>

            {/* Prerequisite Chain Visualization */}
            {course.prerequisites.required.length > 0 && (
              <div>
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    Complete Prerequisite Path
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Visual roadmap showing all courses needed before <span className="font-bold text-red-600">{course.code}</span>
                  </p>
                </div>
                <PrerequisiteFlow course={course} allCourses={allCourses} />
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-t-2 border-gray-200 rounded-b-2xl flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-bold border-2 border-gray-300 transition-all duration-200 shadow-sm"
          >
            Close
          </button>
          <button
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold transition-all duration-200 shadow-lg"
          >
            Add to My Plan
          </button>
        </div>
      </div>
    </div>
  )
}
