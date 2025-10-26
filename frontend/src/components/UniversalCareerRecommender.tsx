import { useState } from "react";
import { CAREER_PATHS, COURSE_SKILLS } from "../data/careerPaths";
import {
  Briefcase,
  Target,
  Award,
  Sparkles,
  Loader,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { api } from "../services/api";

// Define proper TypeScript interfaces
interface BaseCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
  level: string;
  description?: string;
  school?: string;
  hub_requirements?: string[];
}

interface RecommendedCourse extends BaseCourse {
  relevance?: string;
  skillsTaught?: string[];
}

interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  level: string;
  description?: string;
  school?: string;
  hub_requirements?: string[];
}

interface CareerRecommenderProps {
  allCourses: Course[];
  onAddCourse: (course: Course) => void;
}

interface AIResponse {
  career_analysis?: string;
  required_skills?: string[];
  recommended_courses?: Array<{
    code: string;
    relevance: string;
    skills_taught: string[];
  }>;
  skill_coverage_percentage?: number;
  additional_advice?: string;
  error?: string;
  message?: string;
}

export default function UniversalCareerRecommender({
  allCourses,
  onAddCourse,
}: CareerRecommenderProps) {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [customCareer, setCustomCareer] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const selectedPath = CAREER_PATHS.find((p) => p.id === selectedCareer);

  // Get recommended courses based on AI or preset - FIXED TYPE ISSUE
  const getRecommendedCourses = (): RecommendedCourse[] => {
    if (aiRecommendations?.recommended_courses) {
      return aiRecommendations.recommended_courses
        .map((rec) => {
          // Find course by code - more flexible matching
          const course = allCourses.find(
            (c) =>
              c.code === rec.code ||
              c.code.replace(/\s+/g, " ") === rec.code.replace(/\s+/g, " ") ||
              c.code.includes(rec.code) ||
              rec.code.includes(c.code)
          );
          return course
            ? {
                ...course,
                relevance: rec.relevance,
                skillsTaught: rec.skills_taught,
              }
            : null;
        })
        .filter((course): course is RecommendedCourse => course !== null);
    }

    if (!selectedPath) return [];

    return selectedPath.recommendedCourses
      .map((code) => allCourses.find((c) => c.code === code))
      .filter((course): course is Course => course !== null)
      .map((course) => ({ ...course }));
  };

  const getCourseSkills = (courseCode: string) => {
    return COURSE_SKILLS[courseCode] || [];
  };

  const getSkillCoverage = () => {
    if (aiRecommendations?.skill_coverage_percentage) {
      return aiRecommendations.skill_coverage_percentage;
    }

    if (!selectedPath) return 0;

    const recommendedCourses = getRecommendedCourses();
    const allSkillsFromCourses = new Set<string>();

    recommendedCourses.forEach((course) => {
      getCourseSkills(course.code).forEach((skill) =>
        allSkillsFromCourses.add(skill)
      );
    });

    const coveredRequiredSkills = selectedPath.requiredSkills.filter((skill) =>
      Array.from(allSkillsFromCourses).some(
        (courseSkill) =>
          courseSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(courseSkill.toLowerCase())
      )
    );

    return Math.round(
      (coveredRequiredSkills.length / selectedPath.requiredSkills.length) * 100
    );
  };

  // Handle custom career submission - uses your existing ai_advisor.py endpoint
  const handleCustomCareerSubmit = async () => {
    if (!customCareer.trim()) return;

    setLoading(true);
    setAiRecommendations(null);
    setError("");

    try {
      console.log("Sending career goal:", customCareer);

      const response = await api.post("/api/ai-advisor/", {
        career_goal: customCareer,
        major: "Any",
      });

      console.log("AI Response:", response.data);

      if (response.data.error) {
        throw new Error(
          response.data.error ||
            response.data.message ||
            "Unknown error from AI service"
        );
      }

      if (
        !response.data.recommended_courses ||
        response.data.recommended_courses.length === 0
      ) {
        throw new Error(
          "No courses found for this career path. Try a different career goal."
        );
      }

      setAiRecommendations(response.data);
      setSelectedCareer(null);
    } catch (error: any) {
      console.error("Error getting AI recommendations:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to connect to AI service. Please check if the backend server is running.";
      setError(errorMessage);

      // Fallback: Show some basic courses if AI fails
      if (allCourses.length > 0) {
        const fallbackCourses = allCourses
          .filter(
            (course) =>
              course.title.toLowerCase().includes("environment") ||
              course.title.toLowerCase().includes("sustainability") ||
              course.title.toLowerCase().includes("climate") ||
              course.title.toLowerCase().includes("policy")
          )
          .slice(0, 6)
          .map((course) => ({
            code: course.code,
            relevance: `Relevant to ${customCareer} based on course title`,
            skills_taught: [
              "Environmental Awareness",
              "Policy Analysis",
              "Sustainability",
            ],
          }));

        if (fallbackCourses.length > 0) {
          setAiRecommendations({
            career_analysis: `Based on your interest in ${customCareer}, here are some relevant courses from our catalog.`,
            required_skills: [
              "Environmental Science",
              "Policy Analysis",
              "Sustainability",
              "Communication",
            ],
            recommended_courses: fallbackCourses,
            skill_coverage_percentage: 60,
            additional_advice:
              "These courses were selected based on title relevance. For more specific recommendations, ensure the AI service is running.",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle chat message submission - uses your existing gemini endpoint
  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return;

    setChatLoading(true);
    setChatResponse("");
    setError("");

    try {
      const response = await api.post("/api/gemini/", {
        prompt: `As an academic advisor helping university students with course selection and career planning, please provide helpful advice for this question: "${chatMessage}"

Please consider:
- Course relevance to academic goals
- Career preparation and skill development
- Balancing workload and interests
- University requirements and prerequisites

Provide specific, actionable advice.`,
      });

      // Handle response from your gemini endpoint
      if (response.data.result) {
        setChatResponse(response.data.result);
      } else if (typeof response.data === "string") {
        setChatResponse(response.data);
      } else {
        setChatResponse(JSON.stringify(response.data, null, 2));
      }
    } catch (error: any) {
      console.error("Error getting chat response:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to connect to AI service. Please check if the backend server is running.";
      setError(errorMessage);
      setChatResponse("Sorry, I encountered an error. Please try again later.");
    } finally {
      setChatLoading(false);
    }
  };

  const requiredSkills = aiRecommendations
    ? aiRecommendations.required_skills || []
    : selectedPath?.requiredSkills || [];

  const careerName = aiRecommendations
    ? customCareer
    : selectedPath?.name || "";

  const careerDescription = aiRecommendations
    ? aiRecommendations.career_analysis || ""
    : selectedPath?.description || "";

  // Handle adding individual course to plan
  const handleAddCourse = (course: RecommendedCourse) => {
    // Convert RecommendedCourse back to Course for the onAddCourse function
    const baseCourse: Course = {
      id: course.id,
      code: course.code,
      title: course.title,
      credits: course.credits,
      level: course.level,
      description: course.description,
      school: course.school,
      hub_requirements: course.hub_requirements,
    };
    onAddCourse(baseCourse);
  };

  // Handle adding all recommended courses to plan
  const handleAddAllCourses = () => {
    const recommendedCourses = getRecommendedCourses();
    recommendedCourses.forEach((course) => {
      const baseCourse: Course = {
        id: course.id,
        code: course.code,
        title: course.title,
        credits: course.credits,
        level: course.level,
        description: course.description,
        school: course.school,
        hub_requirements: course.hub_requirements,
      };
      onAddCourse(baseCourse);
    });
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <div className="font-bold">Connection Error</div>
          </div>
          <div className="text-red-700 mt-2 text-sm">{error}</div>
          <div className="text-red-600 mt-2 text-xs">
            Make sure your backend server is running on localhost:8000
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowCustom(false);
            setAiRecommendations(null);
            setError("");
          }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            !showCustom
              ? "bg-red-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📚 Browse Career Paths
        </button>
        <button
          onClick={() => {
            setShowCustom(true);
            setSelectedCareer(null);
            setError("");
          }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            showCustom
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <Sparkles size={20} />
          AI Custom Advisor
        </button>
      </div>

      {/* AI Chat Advisor - Now in Semester Planner */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="text-blue-600" />
          AI Study Advisor
        </h3>
        <p className="text-gray-700 mb-4">
          Your personal advisor for academic planning and course recommendations
        </p>

        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask about your degree progress, course recommendations, or any academic questions..."
              className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
            />
            <button
              onClick={handleChatSubmit}
              disabled={chatLoading || !chatMessage.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-bold transition-all flex items-center gap-2"
            >
              {chatLoading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Thinking...
                </>
              ) : (
                <>
                  <MessageCircle size={20} />
                  Ask
                </>
              )}
            </button>
          </div>

          {chatResponse && (
            <div className="bg-white rounded-lg p-4 border-2 border-blue-200 animate-in fade-in duration-300">
              <div className="text-sm text-gray-600 mb-2">Response:</div>
              <div className="text-gray-800 whitespace-pre-wrap">
                {chatResponse}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom AI Career Input */}
      {showCustom && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-600" />
            Tell us your career goal
          </h3>
          <p className="text-gray-700 mb-4">
            Enter any career path - our AI will search through all courses and
            recommend the most relevant ones!
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={customCareer}
              onChange={(e) => setCustomCareer(e.target.value)}
              placeholder="e.g., Environmental Policy Analyst, Marketing Manager, Medical Researcher..."
              className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) =>
                e.key === "Enter" && handleCustomCareerSubmit()
              }
            />
            <button
              onClick={handleCustomCareerSubmit}
              disabled={loading || !customCareer.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-bold transition-all flex items-center gap-2 min-w-40"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Get Recommendations
                </>
              )}
            </button>
          </div>
          {customCareer && !loading && (
            <div className="mt-3 text-sm text-gray-600">
              Ready to search for courses related to:{" "}
              <strong>"{customCareer}"</strong>
            </div>
          )}
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
            {CAREER_PATHS.map((career) => (
              <button
                key={career.id}
                onClick={() => {
                  setSelectedCareer(career.id);
                  setAiRecommendations(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedCareer === career.id
                    ? "border-red-600 bg-red-50 shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:border-red-300 hover:shadow-md"
                }`}
              >
                <div className="text-4xl mb-2">{career.icon}</div>
                <div className="font-bold text-gray-900 mb-1">
                  {career.name}
                </div>
                <div className="text-xs text-gray-600">
                  {career.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Display */}
      {(selectedPath || aiRecommendations) && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Career Info */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {selectedPath?.icon || "🎯"} {careerName}
                </h4>
                <p className="text-gray-700 mb-4">{careerDescription}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPath?.salaryRange && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="text-green-600" size={20} />
                      <div>
                        <div className="text-xs text-gray-600">
                          Salary Range
                        </div>
                        <div className="font-bold text-gray-900">
                          {selectedPath.salaryRange}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Award className="text-purple-600" size={20} />
                    <div>
                      <div className="text-xs text-gray-600">
                        Skill Coverage
                      </div>
                      <div className="font-bold text-gray-900">
                        {getSkillCoverage()}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          {requiredSkills.length > 0 && (
            <div>
              <h5 className="font-bold text-gray-900 mb-3">
                Required Skills for {careerName}
              </h5>
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
          )}

          {/* AI Additional Advice */}
          {aiRecommendations?.additional_advice && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="font-bold text-blue-900 mb-2">
                💡 Additional Advice
              </div>
              <p className="text-blue-800 text-sm">
                {aiRecommendations.additional_advice}
              </p>
            </div>
          )}

          {/* Recommended Courses */}
          <div>
            <h5 className="font-bold text-gray-900 mb-3">
              📚 AI-Recommended Courses ({getRecommendedCourses().length}{" "}
              courses)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getRecommendedCourses().map(
                (course: RecommendedCourse, index: number) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-red-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-xs text-gray-500 font-medium">
                          Course {index + 1}
                        </div>
                        <div className="font-bold text-lg text-gray-900">
                          {course.code}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {course.title}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddCourse(course)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Add +
                      </button>
                    </div>

                    {/* AI Relevance Explanation */}
                    {course.relevance && (
                      <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-xs font-medium text-purple-900 mb-1">
                          Why this course?
                        </div>
                        <div className="text-xs text-purple-800">
                          {course.relevance}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        Skills you'll learn:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(
                          course.skillsTaught ||
                          getCourseSkills(course.code).slice(0, 3)
                        ).map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs text-gray-500">
                        {course.credits} credits
                      </div>
                      {course.school && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {course.school}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              🎯 This path gives you {getSkillCoverage()}% of required skills!
            </div>
            <p className="text-gray-700 mb-4">
              Following these {getRecommendedCourses().length} courses will
              prepare you for a career as a {careerName}
            </p>
            <button
              onClick={handleAddAllCourses}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Add All to My Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
