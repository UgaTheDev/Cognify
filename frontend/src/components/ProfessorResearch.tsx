import { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Mail,
  ExternalLink,
  Loader,
  Network,
} from "lucide-react";

interface ProfessorResearchProps {
  courseCode: string;
  courseName: string;
}

export default function ProfessorResearch({
  courseCode,
  courseName,
}: ProfessorResearchProps) {
  const [professors, setProfessors] = useState<any[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
  const [professorDetails, setProfessorDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showEmailGenerator, setShowEmailGenerator] = useState(false);
  const [studentInterests, setStudentInterests] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    loadProfessors();
  }, []);

  const loadProfessors = async () => {
    try {
      const response = await api.get("/api/professors/");
      setProfessors(response.data.professors);
    } catch (error) {
      console.error("Error loading professors:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessorDetails = async (professorName: string) => {
    setDetailsLoading(true);
    try {
      const response = await api.get(
        `/api/professors/${encodeURIComponent(professorName)}`
      );
      setProfessorDetails(response.data);
    } catch (error) {
      console.error("Error loading professor details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSelectProfessor = (professor: any) => {
    setSelectedProfessor(professor);
    loadProfessorDetails(professor.emp_name);
    setShowEmailGenerator(false);
    setGeneratedEmail("");
  };

  const handleGenerateEmail = async () => {
    if (!studentInterests.trim()) {
      alert("Please enter your research interests");
      return;
    }

    setEmailLoading(true);
    try {
      const response = await api.post("/api/professors/cold-email", {
        professor_name: selectedProfessor.emp_name,
        student_interests: studentInterests,
        course_context: courseName,
      });
      setGeneratedEmail(response.data.email);
    } catch (error) {
      console.error("Error generating email:", error);
      alert("Failed to generate email. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professor Selection */}
      {!selectedProfessor && (
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            👨‍🏫 Who's Teaching {courseCode}?
          </h4>
          <p className="text-gray-600 mb-4">
            Explore professors who teach this course and their research
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professors.slice(0, 6).map((professor, index) => (
              <button
                key={professor.oaid || index}
                onClick={() => handleSelectProfessor(professor)}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-red-600 hover:shadow-lg transition-all text-left"
              >
                <div className="font-bold text-gray-900">
                  {professor.emp_name}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {professor.primary_department}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {professor.primary_role}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Professor Details */}
      {selectedProfessor && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-bold text-gray-900">
              {selectedProfessor.emp_name}
            </h4>
            <button
              onClick={() => {
                setSelectedProfessor(null);
                setProfessorDetails(null);
                setShowEmailGenerator(false);
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
            >
              Back to List
            </button>
          </div>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-red-600" size={48} />
            </div>
          ) : professorDetails ? (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="text-blue-600" size={20} />
                    <div className="text-sm font-medium text-blue-900">
                      Publications
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {professorDetails.openalex_data?.works_count || 0}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="text-green-600" size={20} />
                    <div className="text-sm font-medium text-green-900">
                      Citations
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {professorDetails.openalex_data?.cited_by_count || 0}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-purple-600" size={20} />
                    <div className="text-sm font-medium text-purple-900">
                      H-Index
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {professorDetails.openalex_data?.summary_stats?.h_index ||
                      0}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="text-orange-600" size={20} />
                    <div className="text-sm font-medium text-orange-900">
                      Collaborators
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {professorDetails.coauthors?.length || 0}
                  </div>
                </div>
              </div>

              {/* Research Areas */}
              {professorDetails.openalex_data?.x_concepts && (
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <h5 className="font-bold text-gray-900 mb-4">
                    Research Areas
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {professorDetails.openalex_data.x_concepts
                      .slice(0, 10)
                      .map((concept: any) => (
                        <span
                          key={concept.id}
                          className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                        >
                          {concept.display_name}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Recent Publications */}
              {professorDetails.recent_works &&
                professorDetails.recent_works.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h5 className="font-bold text-gray-900 mb-4">
                      Recent Publications
                    </h5>
                    <div className="space-y-3">
                      {professorDetails.recent_works
                        .slice(0, 5)
                        .map((work: any, index: number) => (
                          <div
                            key={work.id || index}
                            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="font-medium text-gray-900">
                              {work.title}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>{work.publication_year}</span>
                              <span>• {work.cited_by_count} citations</span>
                              {work.doi && (
                                <a
                                  href={`https://doi.org/${work.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                  <ExternalLink size={14} />
                                  View Paper
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Collaboration Network */}
              {professorDetails.coauthors &&
                professorDetails.coauthors.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Network size={20} />
                      Frequent Collaborators
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {professorDetails.coauthors
                        .slice(0, 8)
                        .map((coauthor: any, index: number) => (
                          <div
                            key={coauthor.id || index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium text-gray-900">
                              {coauthor.name}
                            </span>
                            <span className="text-sm text-gray-600">
                              {coauthor.count} papers
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Cold Email Generator */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-bold text-gray-900 flex items-center gap-2">
                    <Mail size={20} />
                    Interested in Research?
                  </h5>
                  <button
                    onClick={() => setShowEmailGenerator(!showEmailGenerator)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    {showEmailGenerator ? "Hide" : "Generate Cold Email"}
                  </button>
                </div>

                {showEmailGenerator && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Research Interests & Background
                      </label>
                      <textarea
                        value={studentInterests}
                        onChange={(e) => setStudentInterests(e.target.value)}
                        placeholder="e.g., I'm interested in machine learning and computer vision. I have experience with Python, TensorFlow, and have completed CS 542..."
                        className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>

                    <button
                      onClick={handleGenerateEmail}
                      disabled={emailLoading}
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                    >
                      {emailLoading ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Mail size={20} />
                          Generate Personalized Email
                        </>
                      )}
                    </button>

                    {generatedEmail && (
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-300">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-gray-900">
                            Your Personalized Email
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedEmail);
                              alert("Email copied to clipboard!");
                            }}
                            className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm font-medium"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {generatedEmail}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No research data available for this professor
            </div>
          )}
        </div>
      )}
    </div>
  );
}
