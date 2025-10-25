import { usePlannerStore } from '../store/plannerStore'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { Award, BookOpen, CheckCircle, TrendingUp } from 'lucide-react'

export default function Progress() {
  const { semesters } = usePlannerStore()

  // Calculate stats
  const allCourses = semesters.flatMap(s => s.courses)
  const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0)
  const uniqueCourses = new Set(allCourses.map(c => c.code)).size
  
  // Degree requirements (example - adjust based on BU CS requirements)
  const DEGREE_REQUIREMENTS = {
    totalCredits: 128,
    csCoreCredits: 48,
    hubCredits: 40,
    electiveCredits: 40
  }

  // Calculate progress
  const overallProgress = Math.min(Math.round((totalCredits / DEGREE_REQUIREMENTS.totalCredits) * 100), 100)
  const csProgress = Math.min(Math.round((totalCredits / DEGREE_REQUIREMENTS.csCoreCredits) * 100), 100)

  // Estimate graduation
  const averageCreditsPerSemester = totalCredits / semesters.filter(s => s.courses.length > 0).length || 0
  const remainingCredits = DEGREE_REQUIREMENTS.totalCredits - totalCredits
  const semestersRemaining = Math.ceil(remainingCredits / Math.max(averageCreditsPerSemester, 15))

  // Skills gained
  const allSkills = new Set<string>()
  allCourses.forEach(course => {
    if (course.code === 'CS 111') {
      allSkills.add('Python')
      allSkills.add('Programming Fundamentals')
    } else if (course.code === 'CS 112') {
      allSkills.add('Data Structures')
      allSkills.add('Algorithms')
      allSkills.add('Object-Oriented Programming')
    } else if (course.code === 'CS 210') {
      allSkills.add('Computer Systems')
      allSkills.add('C Programming')
    } else if (course.code === 'CS 330') {
      allSkills.add('Algorithm Analysis')
      allSkills.add('Complexity Theory')
    }
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Degree Progress</h1>
        <p className="text-gray-600">Track your journey to graduation</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Overall Progress */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
          <div className="w-32 h-32 mx-auto mb-4">
            <CircularProgressbar
              value={overallProgress}
              text={`${overallProgress}%`}
              styles={buildStyles({
                textColor: '#CC0000',
                pathColor: '#CC0000',
                trailColor: '#FEE2E2'
              })}
            />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalCredits} / {DEGREE_REQUIREMENTS.totalCredits}</div>
            <div className="text-sm text-gray-600">Total Credits</div>
          </div>
        </div>

        {/* Courses Completed */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
            <BookOpen className="text-blue-600" size={32} />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{uniqueCourses}</div>
            <div className="text-sm text-gray-600">Courses Planned</div>
          </div>
        </div>

        {/* Skills Acquired */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full">
            <Award className="text-purple-600" size={32} />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{allSkills.size}</div>
            <div className="text-sm text-gray-600">Skills Acquired</div>
          </div>
        </div>

        {/* Estimated Graduation */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <TrendingUp className="text-green-600" size={32} />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {remainingCredits > 0 ? semestersRemaining : 0}
            </div>
            <div className="text-sm text-gray-600">
              {remainingCredits > 0 ? 'Semesters Left' : 'Complete!'}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Requirements Progress */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Degree Requirements</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">CS Core Courses</span>
                <span className="text-sm font-bold text-gray-900">{totalCredits} / {DEGREE_REQUIREMENTS.csCoreCredits}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${csProgress}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">BU Hub</span>
                <span className="text-sm font-bold text-gray-900">0 / {DEGREE_REQUIREMENTS.hubCredits}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Electives</span>
                <span className="text-sm font-bold text-gray-900">0 / {DEGREE_REQUIREMENTS.electiveCredits}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Skills Acquired</h3>
          {allSkills.size > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Array.from(allSkills).map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award size={48} className="mx-auto mb-3 opacity-50" />
              <p>Add courses to your plan to see skills you'll acquire!</p>
            </div>
          )}
        </div>
      </div>

      {/* Semester by Semester */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Semester Timeline</h3>
        <div className="space-y-4">
          {semesters.map((semester, index) => {
            const semesterCredits = semester.courses.reduce((sum, c) => sum + c.credits, 0)
            
            return (
              <div key={semester.id} className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  semester.courses.length > 0 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {semester.courses.length > 0 ? (
                    <CheckCircle size={20} />
                  ) : (
                    <span className="font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{semester.name}</div>
                  <div className="text-sm text-gray-600">
                    {semester.courses.length === 0 
                      ? 'No courses planned' 
                      : `${semester.courses.length} courses • ${semesterCredits} credits`
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Motivational Message */}
      {overallProgress > 0 && (
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 text-center">
          <div className="text-3xl mb-2">
            {overallProgress < 25 ? '🌱' : overallProgress < 50 ? '🌿' : overallProgress < 75 ? '🌳' : '🎓'}
          </div>
          <div className="text-xl font-bold text-gray-900 mb-2">
            {overallProgress < 25 && "You're just getting started! Keep going!"}
            {overallProgress >= 25 && overallProgress < 50 && "Great progress! You're building momentum!"}
            {overallProgress >= 50 && overallProgress < 75 && "Halfway there! Stay focused!"}
            {overallProgress >= 75 && overallProgress < 100 && "Almost done! The finish line is in sight!"}
            {overallProgress >= 100 && "Congratulations! You're ready to graduate! 🎉"}
          </div>
          <div className="text-gray-700">
            {remainingCredits > 0 
              ? `${remainingCredits} credits remaining to complete your degree`
              : 'You have enough credits to graduate!'
            }
          </div>
        </div>
      )}
    </div>
  )
}
