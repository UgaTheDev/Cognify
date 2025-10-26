import { usePlannerStore } from '../store/plannerStore'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { Award, BookOpen, CheckCircle, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { callGemini } from '../services/api'

function PromptBox() {
  const [promptText, setPromptText] = useState<string>('')
  const [response, setResponse] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    setError(null)
    setResponse('')
    if (!promptText.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    try {
      const res = await callGemini({ prompt: promptText })
      const data = res.data
      
      if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error))
      }
      
      if (data.result) {
        setResponse(String(data.result))
      } else if (data.output) {
        setResponse(JSON.stringify(data.output))
      } else {
        setResponse(JSON.stringify(data))
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 
                         err?.response?.data?.error?.message ||
                         err?.message || 
                         'Request failed'
      setError(errorMessage)
      console.error('AI Assistant Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Input Area */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <span className="font-medium text-gray-700">Ask a Question</span>
        </div>
        <div className="p-4">
          <textarea
            value={promptText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPromptText(e.target.value)}
            className="w-full border rounded-md px-4 py-2 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows={3}
            placeholder="Ask about your degree progress, course recommendations, or any academic questions..."
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Ask AI'}
            </button>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Response Area */}
      <div className="mt-6 border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <span className="font-medium text-gray-700">Response</span>
        </div>
        <div className="p-4 min-h-[100px] bg-white">
          {loading ? (
            <div className="text-gray-500 italic">Thinking...</div>
          ) : response ? (
            <div className="prose max-w-none">
              <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                {response}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 italic">
              No response yet. Try asking a question above.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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

      {/* AI Assistant */}
      <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Study Advisor</h3>
            <p className="text-sm text-gray-600">
              Your personal advisor for academic planning and course recommendations
            </p>
          </div>
        </div>
        <PromptBox />
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
