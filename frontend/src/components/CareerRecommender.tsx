import { useState } from 'react'
import { CAREER_PATHS, COURSE_SKILLS } from '../data/careerPaths'
import { Briefcase, Target, Award } from 'lucide-react'

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

export default function CareerRecommender({ allCourses, onAddCourse }: CareerRecommenderProps) {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null)

  const selectedPath = CAREER_PATHS.find(p => p.id === selectedCareer)

  const getRecommendedCourses = () => {
    if (!selectedPath) return []
    
    return selectedPath.recommendedCourses
      .map(code => allCourses.find(c => c.code === code))
      .filter(Boolean) as Course[]
  }

  const getCourseSkills = (courseCode: string) => {
    return COURSE_SKILLS[courseCode] || []
  }

  const getSkillCoverage = () => {
    if (!selectedPath) return 0
    
    const recommendedCourses = getRecommendedCourses()
    const allSkillsFromCourses = new Set<string>()
    
    recommendedCourses.forEach(course => {
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

  return (
    <div className="space-y-6">
      {/* Career Path Selection */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="text-red-600" />
          Choose Your Career Goal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAREER_PATHS.map(career => (
            <button
              key={career.id}
              onClick={() => setSelectedCareer(career.id)}
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

      {/* Recommendations */}
      {selectedPath && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Career Info */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {selectedPath.icon} {selectedPath.name}
                </h4>
                <p className="text-gray-700 mb-4">{selectedPath.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="text-green-600" size={20} />
                    <div>
                      <div className="text-xs text-gray-600">Salary Range</div>
                      <div className="font-bold text-gray-900">{selectedPath.salaryRange}</div>
                    </div>
                  </div>
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
            <h5 className="font-bold text-gray-900 mb-3">Required Skills for {selectedPath.name}</h5>
            <div className="flex flex-wrap gap-2">
              {selectedPath.requiredSkills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Courses */}
          <div>
            <h5 className="font-bold text-gray-900 mb-3">
              📚 Recommended Course Path ({getRecommendedCourses().length} courses)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getRecommendedCourses().map((course, index) => (
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
                  
                  {/* Skills from this course */}
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">Skills you'll learn:</div>
                    <div className="flex flex-wrap gap-1">
                      {getCourseSkills(course.code).slice(0, 3).map(skill => (
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
              Following these {getRecommendedCourses().length} courses will prepare you for a career as a {selectedPath.name}
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
