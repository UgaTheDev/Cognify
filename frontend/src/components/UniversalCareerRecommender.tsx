import { useState } from 'react'
import { CAREER_PATHS, COURSE_SKILLS } from '../data/careerPaths'
import { Briefcase, Target, Award, Sparkles, Loader } from 'lucide-react'
import { api } from '../services/api'

interface Course {
  id: string
  code: string
  title: string
  credits: number
  level: string
}

interface CareerRecommenderProps {
  allCourses: Course[]
  onAddCourse: (course: Course) => void
}

export default function UniversalCareerRecommender({ allCourses, onAddCourse }: CareerRecommenderProps) {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null)
  const [customCareer, setCustomCareer] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const selectedPath = CAREER_PATHS.find(p => p.id === selectedCareer)

  const getRecommendedCourses = () => {
    if (aiRecommendations) {
      // Use AI recommendations
      return aiRecommendations.recommended_courses
        .map((rec: any) => {
          const course = allCourses.find(c => c.code === rec.code)
          return course ? { ...course, relevance: rec.relevance, skillsTaught: rec.skills_taught } : null
        })
        .filter(Boolean)
    }
    
    if (!selectedPath) return []
    
    return selectedPath.recommendedCourses
      .map(code => allCourses.find(c => c.code === code))
      .filter(Boolean) as Course[]
  }

  const getCourseSkills = (courseCode: string) => {
    return COURSE_SKILLS[courseCode] || []
  }

  const getSkillCoverage = () => {
    if (aiRecommendations) {
      return aiRecommendations.skill_coverage_percentage || 0
    }
    
    if (!selectedPath) return 0
    
    const recommendedCourses = getRecommendedCourses()
    const allSkillsFromCourses = new Set<string>()
    
    recommendedCourses.forEach((course: any) => {
      getCourseSkills(course.code).forEach(skill => allSkillsFromCourses.add(skill))
    })
    
    const coveredRequiredSkills = selectedPath.requiredSkills.filter(skill =>
      Array.from(allSkillsFromCourses).some(courseSkill => 
        courseSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(courseSkill.toLowerCase())
      )
    )
    
    return Math.round((coveredRequiredSkills.length / selectedPath.requiredSkills.length) * 100)
  }

  const handleCustomCareerSubmit = async () => {
    if (!customCareer.trim()) return
    
    setLoading(true)
    setAiRecommendations(null)
    
    try {
      const response = await api.post('/api/ai-advisor/', {
        career_goal: customCareer,
        major: 'Computer Science' // Could make this dynamic too
      })
      
      setAiRecommendations(response.data)
      setSelectedCareer(null)
    } catch (error) {
      console.error('Error getting AI recommendations:', error)
      alert('Failed to get AI recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const requiredSkills = aiRecommendations 
    ? aiRecommendations.required_skills 
    : selectedPath?.requiredSkills || []

  const careerName = aiRecommendations
    ? customCareer
    : selectedPath?.name || ''

  const careerDescription = aiRecommendations
    ? aiRecommendations.career_analysis
    : selectedPath?.description || ''

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => { setShowCustom(false); setAiRecommendations(null); }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            !showCustom
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📚 Browse Career Paths
        </button>
        <button
          onClick={() => { setShowCustom(true); setSelectedCareer(null); }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            showCustom
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Sparkles size={20} />
          AI Custom Advisor
        </button>
      </div>

      {/* Custom AI Career Input */}
      {showCustom && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-600" />
            Tell us your career goal
          </h3>
          <p className="text-gray-700 mb-4">
            Enter any career path - our AI will recommend the best courses for you!
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={customCareer}
              onChange={(e) => setCustomCareer(e.target.value)}
              placeholder="e.g., Environmental Policy Analyst, Marketing Manager, Medical Researcher..."
              className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleCustomCareerSubmit()}
            />
            <button
              onClick={handleCustomCareerSubmit}
              disabled={loading || !customCareer.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-bold transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Get Recommendations
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Preset Career Paths */}
      {!showCustom && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="text-red-600" />
            Choose a Career Path
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAREER_PATHS.map(career => (
              <button
                key={career.id}
                onClick={() => { setSelectedCareer(career.id); setAiRecommendations(null); }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedCareer === career.id
                    ? 'border-red-600 bg-red-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-md'
                }`}
              >
                <div className="text-4xl mb-2">{career.icon}</div>
                <div className="font-bold text-gray-900 mb-1">{career.name}</div>
                <div className="text-xs text-gray-600">{career.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Display (Works for both preset and AI) */}
      {(selectedPath || aiRecommendations) && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Career Info */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {selectedPath?.icon || '🎯'} {careerName}
                </h4>
                <p className="text-gray-700 mb-4">{careerDescription}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPath?.salaryRange && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="text-green-600" size={20} />
                      <div>
                        <div className="text-xs text-gray-600">Salary Range</div>
                        <div className="font-bold text-gray-900">{selectedPath.salaryRange}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Award className="text-purple-600" size={20} />
                    <div>
                      <div className="text-xs text-gray-600">Skill Coverage</div>
                      <div className="font-bold text-gray-900">{getSkillCoverage()}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <h5 className="font-bold text-gray-900 mb-3">Required Skills for {careerName}</h5>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* AI Additional Advice */}
          {aiRecommendations?.additional_advice && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="font-bold text-blue-900 mb-2">💡 Additional Advice</div>
              <p className="text-blue-800 text-sm">{aiRecommendations.additional_advice}</p>
            </div>
          )}

          {/* Recommended Courses */}
          <div>
            <h5 className="font-bold text-gray-900 mb-3">
              📚 Recommended Course Path ({getRecommendedCourses().length} courses)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getRecommendedCourses().map((course: any, index: number) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-red-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Step {index + 1}</div>
                      <div className="font-bold text-lg text-gray-900">{course.code}</div>
                      <div className="text-sm text-gray-600 mt-1">{course.title}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      course.level === 'Introductory' ? 'bg-green-100 text-green-800' :
                      course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                      course.level === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                  
                  {/* AI Relevance Explanation */}
                  {course.relevance && (
                    <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xs font-medium text-purple-900 mb-1">Why this course?</div>
                      <div className="text-xs text-purple-800">{course.relevance}</div>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">Skills you'll learn:</div>
                    <div className="flex flex-wrap gap-1">
                      {(course.skillsTaught || getCourseSkills(course.code).slice(0, 3)).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-2">{course.credits} credits</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              🎯 This path gives you {getSkillCoverage()}% of required skills!
            </div>
            <p className="text-gray-700 mb-4">
              Following these {getRecommendedCourses().length} courses will prepare you for a career as a {careerName}
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              Add All to My Plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
