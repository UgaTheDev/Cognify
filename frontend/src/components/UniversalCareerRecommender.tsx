import { useState, useEffect } from "react";
import {
  Award,
  Sparkles,
  Loader,
  MessageCircle,
  AlertCircle,
  Building2,
  X,
} from "lucide-react";
import { api } from "../services/api";

// Types
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

interface RecommendedCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
  level: string;
  description?: string;
  school?: string;
  hub_requirements?: string[];
  relevance: string;
  skillsTaught: string[];
}

interface School {
  code: string;
  name: string;
  course_count: number;
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
    name?: string;
    school?: string;
    relevance: string;
    skills_taught: string[];
    match_score?: number;
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
  const [customCareer, setCustomCareer] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<AIResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // NEW: School filtering state
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  // Fetch available schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await api.get("/api/schools");
        if (response.data.schools) {
          setAvailableSchools(response.data.schools);
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };
    fetchSchools();
  }, []);

  // Toggle school selection
  const toggleSchool = (schoolCode: string) => {
    setSelectedSchools((prev) =>
      prev.includes(schoolCode)
        ? prev.filter((s) => s !== schoolCode)
        : [...prev, schoolCode]
    );
  };

  // Clear all school filters
  const clearSchoolFilters = () => {
    setSelectedSchools([]);
  };

  const getRecommendedCourses = (): RecommendedCourse[] => {
    if (aiRecommendations?.recommended_courses) {
      console.log(
        "Raw AI recommendations:",
        aiRecommendations.recommended_courses
      );

      return aiRecommendations.recommended_courses
        .map((rec, index) => {
          console.log(`Processing course ${index + 1}:`, rec);

          // Skip if missing essential data
          if (!rec.code || rec.code.trim() === "" || rec.code === "0") {
            console.warn(`Skipping course ${index + 1}: invalid code`, rec);
            return null;
          }

          // Try to find course in allCourses with STRICT matching
          const course = allCourses.find((c) => {
            // Skip invalid courses in allCourses
            if (!c.code || c.code === "0" || c.code.trim() === "") {
              return false;
            }

            // Normalize both codes for comparison
            const normalizedAllCourse = c.code
              .replace(/\s+/g, " ")
              .trim()
              .toLowerCase();
            const normalizedRecCourse = rec.code
              .replace(/\s+/g, " ")
              .trim()
              .toLowerCase();

            // Exact match (case-insensitive, normalized spacing)
            return normalizedAllCourse === normalizedRecCourse;
          });

          // If not found, create course from backend data
          if (!course) {
            // Skip if we don't have a name from backend
            if (!rec.name || rec.name.trim() === "" || rec.name === "0") {
              console.warn(
                `Course ${rec.code} has no valid name, skipping`,
                rec
              );
              return null;
            }

            console.log(`Creating course from backend data for ${rec.code}`);
            return {
              id: rec.code,
              code: rec.code,
              title: rec.name,
              credits: 4,
              level: "Undergraduate",
              school: rec.school || "BU",
              relevance: rec.relevance || "Relevant to your career goal",
              skillsTaught: rec.skills_taught || [],
            };
          }

          // Found in allCourses, merge with AI data
          console.log(`Found ${rec.code} in allCourses as ${course.code}`);
          const recommendedCourse: RecommendedCourse = {
            id: course.id,
            code: course.code,
            title: course.title,
            credits: course.credits,
            level: course.level,
            description: course.description,
            school: course.school,
            hub_requirements: course.hub_requirements,
            relevance: rec.relevance || "Relevant to your career goal",
            skillsTaught: rec.skills_taught || [],
          };

          return recommendedCourse;
        })
        .filter((course): course is RecommendedCourse => course !== null);
    }

    return [];
  };

  const getSkillCoverage = () => {
    if (aiRecommendations?.skill_coverage_percentage) {
      return aiRecommendations.skill_coverage_percentage;
    }
    return 0;
  };

  const handleCustomCareerSubmit = async () => {
    if (!customCareer.trim()) return;

    setLoading(true);
    setAiRecommendations(null);
    setError("");

    try {
      console.log("Sending career goal:", customCareer);
      console.log("School filters:", selectedSchools);

      const response = await api.post("/api/smart-recommend", {
        career_goal: customCareer,
        major: "Any",
        num_recommendations: 9,
        school_filters: selectedSchools.length > 0 ? selectedSchools : null,
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
          "No courses found for this career path. Try different filters or career goal."
        );
      }

      setAiRecommendations(response.data);
    } catch (error: any) {
      console.error("Error getting AI recommendations:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to connect to AI service. Please check if the backend server is running.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  const requiredSkills = aiRecommendations?.required_skills || [];
  const careerName = customCareer;
  const careerDescription = aiRecommendations?.career_analysis || "";

  const handleAddCourse = (course: RecommendedCourse) => {
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

      {/* AI Chat Advisor */}
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

      {/* Custom AI Career Input with School Filter */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="text-purple-600" />
          AI Course Finder
        </h3>
        <p className="text-gray-700 mb-4">
          Enter any career path - search through 6,000+ BU courses with optional
          school filters!
        </p>

        {/* School Filter */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={18} className="text-purple-600" />
            <label className="text-sm font-medium text-gray-700">
              Filter by School (Optional)
            </label>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
              className="w-full px-4 py-2 bg-white border-2 border-purple-300 rounded-lg text-left flex items-center justify-between hover:border-purple-400 transition-colors"
            >
              <span className="text-sm text-gray-700">
                {selectedSchools.length === 0
                  ? "All Schools"
                  : `${selectedSchools.length} school${
                      selectedSchools.length > 1 ? "s" : ""
                    } selected`}
              </span>
              <Building2 size={16} />
            </button>

            {showSchoolDropdown && (
              <div className="absolute z-10 mt-2 w-full bg-white border-2 border-purple-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-200">
                  <button
                    onClick={clearSchoolFilters}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                {availableSchools.map((school) => (
                  <label
                    key={school.code}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSchools.includes(school.code)}
                      onChange={() => toggleSchool(school.code)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">
                      {school.code}
                    </span>
                    <span className="text-xs text-gray-500">
                      {school.course_count} courses
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Selected Schools Pills */}
          {selectedSchools.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSchools.map((school) => (
                <span
                  key={school}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {school}
                  <button
                    onClick={() => toggleSchool(school)}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Career Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={customCareer}
            onChange={(e) => setCustomCareer(e.target.value)}
            placeholder="e.g., Machine Learning Engineer, Data Scientist, Software Developer..."
            className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={(e) => e.key === "Enter" && handleCustomCareerSubmit()}
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
                Find Courses
              </>
            )}
          </button>
        </div>
        {customCareer && !loading && (
          <div className="mt-3 text-sm text-gray-600">
            Searching for: <strong>"{customCareer}"</strong>
            {selectedSchools.length > 0 && (
              <>
                {" "}
                in <strong>{selectedSchools.join(", ")}</strong>
              </>
            )}
          </div>
        )}
      </div>

      {/* Recommendations Display - Same as before */}
      {aiRecommendations && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Career Info */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  🎯 {careerName}
                </h4>
                <p className="text-gray-700 mb-4">{careerDescription}</p>

                <div className="flex items-center gap-2">
                  <Award className="text-purple-600" size={20} />
                  <div>
                    <div className="text-xs text-gray-600">Skill Coverage</div>
                    <div className="font-bold text-gray-900">
                      {getSkillCoverage()}%
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
              {getRecommendedCourses().map((course, index) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
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
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors flex-shrink-0"
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
                  {course.skillsTaught && course.skillsTaught.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        Skills you'll learn:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {course.skillsTaught.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

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
              ))}
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
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Add All {getRecommendedCourses().length} Courses to My Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
