import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
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

interface ProfessorData {
  professor?: {
    emp_name: string;
    primary_department: string;
    primary_role: string;
    primary_unit: string;
    oaid?: string;
  };
  openalex_data?: any;
  recent_works?: Array<{
    title: string;
    publication_year: number;
    cited_by_count: number;
    doi?: string;
    id?: string;
  }>;
  coauthors?: Array<{ name: string; count?: number; id?: string }>;
  research_summary?: string;
}

function ProfessorDetails() {
  const { name } = useParams<{ name: string }>();
  const [professor, setProfessor] = useState<ProfessorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailGenerator, setShowEmailGenerator] = useState(false);
  const [studentInterests, setStudentInterests] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!name) {
          throw new Error("Professor name is required");
        }

        const response = await fetch(
          `http://localhost:8000/api/professors/${name}`
        );

        if (!response.ok) {
          throw new Error(`Professor not found: ${response.status}`);
        }

        const data: ProfessorData = await response.json();
        setProfessor(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfessor();
  }, [name]);

  const handleGenerateEmail = async () => {
    if (!studentInterests.trim() || !professor?.professor) {
      alert("Please enter your research interests");
      return;
    }

    setEmailLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/professors/cold-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            professor_name: professor.professor.emp_name,
            student_interests: studentInterests,
            course_context: "Research Opportunity", // You can customize this
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate email");
      }

      const data = await response.json();
      setGeneratedEmail(data.email);
    } catch (error) {
      console.error("Error generating email:", error);
      alert("Failed to generate email. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!professor || !professor.professor) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Professor not found</div>
      </div>
    );
  }

  const profData = professor.professor;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {profData.emp_name}
          </h1>
          <div className="text-lg text-gray-600 mb-1">
            {profData.primary_department}
          </div>
          <div className="text-md text-gray-500">
            {profData.primary_role} • {profData.primary_unit}
          </div>
        </div>

        {/* Stats Overview */}
        {professor.openalex_data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="text-blue-600" size={20} />
                <div className="text-sm font-medium text-blue-900">
                  Publications
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {professor.openalex_data?.works_count || 0}
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
                {professor.openalex_data?.cited_by_count || 0}
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
                {professor.openalex_data?.summary_stats?.h_index || 0}
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
                {professor.coauthors?.length || 0}
              </div>
            </div>
          </div>
        )}

        {/* Research Areas */}
        {professor.openalex_data?.x_concepts && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <h5 className="font-bold text-gray-900 mb-4">Research Areas</h5>
            <div className="flex flex-wrap gap-2">
              {professor.openalex_data.x_concepts
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

        {/* Research Summary */}
        {professor.research_summary && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <h5 className="font-bold text-gray-900 mb-4">Research Focus</h5>
            <p className="text-gray-700 leading-relaxed">
              {professor.research_summary}
            </p>
          </div>
        )}

        {/* Recent Publications */}
        {professor.recent_works && professor.recent_works.length > 0 && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <h5 className="font-bold text-gray-900 mb-4">
              Recent Publications
            </h5>
            <div className="space-y-3">
              {professor.recent_works
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
        {professor.coauthors && professor.coauthors.length > 0 && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Network size={20} />
              Frequent Collaborators
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {professor.coauthors
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
                      {coauthor.count || 1} papers
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
      </div>
    </div>
  );
}

export default ProfessorDetails;
