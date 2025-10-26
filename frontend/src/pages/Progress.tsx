import { usePlannerStore } from "../store/plannerStore";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { BookOpen, CheckCircle, TrendingUp } from "lucide-react";

export default function Progress() {
  const { semesters } = usePlannerStore();

  // Calculate stats
  const allCourses = semesters.flatMap((s) => s.courses);
  const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);
  const uniqueCourses = new Set(allCourses.map((c) => c.code)).size;

  // Calculate hub units dynamically by counting total hub areas satisfied
  // Each course has a hub_areas object where keys are hub area names
  const totalHubUnits = allCourses.reduce((sum, c) => {
    // Count the number of hub areas this course satisfies
    if (c.hub_areas && typeof c.hub_areas === "object") {
      return sum + Object.keys(c.hub_areas).length;
    } else if (c.hub_requirements && Array.isArray(c.hub_requirements)) {
      // Fallback for courses with hub_requirements array
      return sum + c.hub_requirements.length;
    }
    return sum;
  }, 0);

  // Calculate hub areas satisfied
  const hubAreasSatisfied = new Set<string>();
  allCourses.forEach((course) => {
    if (course.hub_areas && typeof course.hub_areas === "object") {
      Object.keys(course.hub_areas).forEach((hub) =>
        hubAreasSatisfied.add(hub)
      );
    } else if (
      course.hub_requirements &&
      Array.isArray(course.hub_requirements)
    ) {
      course.hub_requirements.forEach((hub) => hubAreasSatisfied.add(hub));
    }
  });

  // Degree requirements (BU standard requirements)
  const DEGREE_REQUIREMENTS = {
    totalCredits: 128,
    hubCredits: 26, // BU Hub requires 26 units total
  };

  // Calculate progress percentages
  const overallProgress = Math.min(
    Math.round((totalCredits / DEGREE_REQUIREMENTS.totalCredits) * 100),
    100
  );
  const hubProgress = Math.min(
    Math.round((totalHubUnits / DEGREE_REQUIREMENTS.hubCredits) * 100),
    100
  );

  // Estimate graduation
  const averageCreditsPerSemester =
    totalCredits / semesters.filter((s) => s.courses.length > 0).length || 0;
  const remainingCredits = DEGREE_REQUIREMENTS.totalCredits - totalCredits;
  const semestersRemaining = Math.ceil(
    remainingCredits / Math.max(averageCreditsPerSemester, 15)
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Degree Progress
        </h1>
        <p className="text-gray-600">Track your journey to graduation</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Overall Progress */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
          <div className="w-32 h-32 mx-auto mb-4">
            <CircularProgressbar
              value={overallProgress}
              text={`${overallProgress}%`}
              styles={buildStyles({
                textColor: "#CC0000",
                pathColor: "#CC0000",
                trailColor: "#FEE2E2",
              })}
            />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {totalCredits} / {DEGREE_REQUIREMENTS.totalCredits}
            </div>
            <div className="text-sm text-gray-600">Total Credits</div>
          </div>
        </div>

        {/* Hub Requirements Progress */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="w-32 h-32 mx-auto mb-4">
            <CircularProgressbar
              value={hubProgress}
              text={`${hubProgress}%`}
              styles={buildStyles({
                textColor: "#2563EB",
                pathColor: "#2563EB",
                trailColor: "#DBEAFE",
              })}
            />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {totalHubUnits} / {DEGREE_REQUIREMENTS.hubCredits}
            </div>
            <div className="text-sm text-gray-600">BU Hub Units</div>
          </div>
        </div>

        {/* Courses Completed */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full">
            <BookOpen className="text-purple-600" size={32} />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {uniqueCourses}
            </div>
            <div className="text-sm text-gray-600">Courses Planned</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-6 mb-8">
        {/* HUB Areas Detailed Table */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            BU Hub Requirements
          </h3>
          <div className="space-y-3">
            <div className="mb-4 pb-3 border-b border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-bold text-blue-600">{totalHubUnits}</span>{" "}
                of {DEGREE_REQUIREMENTS.hubCredits} hub units satisfied
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 pb-2 border-b border-gray-300 font-semibold text-sm text-gray-700">
              <div className="col-span-1 text-center">✓</div>
              <div className="col-span-7">Hub Requirement</div>
              <div className="col-span-4 text-center">Status</div>
            </div>

            {/* Philosophical, Aesthetic and Historical Capacities */}
            <div className="mt-4 mb-2 text-xs font-bold text-gray-500 uppercase">
              Philosophical, Aesthetic and Historical Capacities
            </div>
            {[
              "Philosophical Inquiry and Life's Meanings",
              "Aesthetic Exploration",
              "Historical Consciousness",
            ].map((hubArea) => {
              const isSatisfied = hubAreasSatisfied.has(hubArea);
              return (
                <div
                  key={hubArea}
                  className={`grid grid-cols-12 gap-2 py-3 border-b border-gray-100 items-center ${
                    isSatisfied ? "bg-green-50" : "bg-gray-50"
                  } rounded px-2`}
                >
                  <div className="col-span-1 flex justify-center">
                    {isSatisfied ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                  <div className="col-span-7">
                    <span
                      className={`text-sm ${
                        isSatisfied
                          ? "font-medium text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {hubArea}
                    </span>
                  </div>
                  <div className="col-span-4 text-center">
                    <span
                      className={`text-sm font-bold ${
                        isSatisfied ? "text-green-700" : "text-gray-400"
                      }`}
                    >
                      {isSatisfied ? "Fulfilled" : "Unfulfilled"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Scientific and Social Inquiry */}
            <div className="mt-4 mb-2 text-xs font-bold text-gray-500 uppercase">
              Scientific and Social Inquiry
            </div>
            {[
              "Scientific Inquiry I",
              "Scientific Inquiry II",
              "Social Inquiry I",
              "Social Inquiry II",
            ].map((hubArea) => {
              const isSatisfied = hubAreasSatisfied.has(hubArea);
              const note =
                hubArea === "Scientific Inquiry II"
                  ? " (OR Social Inquiry II)"
                  : "";
              return (
                <div
                  key={hubArea}
                  className={`grid grid-cols-12 gap-2 py-3 border-b border-gray-100 items-center ${
                    isSatisfied ? "bg-green-50" : "bg-gray-50"
                  } rounded px-2`}
                >
                  <div className="col-span-1 flex justify-center">
                    {isSatisfied ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                  <div className="col-span-7">
                    <span
                      className={`text-sm ${
                        isSatisfied
                          ? "font-medium text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {hubArea}
                      {note}
                    </span>
                  </div>
                  <div className="col-span-4 text-center">
                    <span
                      className={`text-sm font-bold ${
                        isSatisfied ? "text-green-700" : "text-gray-400"
                      }`}
                    >
                      {isSatisfied ? "Fulfilled" : "Unfulfilled"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quantitative Reasoning */}
            <div className="mt-4 mb-2 text-xs font-bold text-gray-500 uppercase">
              Quantitative Reasoning
            </div>
            {["Quantitative Reasoning I", "Quantitative Reasoning II"].map(
              (hubArea) => {
                const isSatisfied = hubAreasSatisfied.has(hubArea);
                return (
                  <div
                    key={hubArea}
                    className={`grid grid-cols-12 gap-2 py-3 border-b border-gray-100 items-center ${
                      isSatisfied ? "bg-green-50" : "bg-gray-50"
                    } rounded px-2`}
                  >
                    <div className="col-span-1 flex justify-center">
                      {isSatisfied ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                    <div className="col-span-7">
                      <span
                        className={`text-sm ${
                          isSatisfied
                            ? "font-medium text-gray-900"
                            : "text-gray-600"
                        }`}
                      >
                        {hubArea}
                      </span>
                    </div>
                    <div className="col-span-4 text-center">
                      <span
                        className={`text-sm font-bold ${
                          isSatisfied ? "text-green-700" : "text-gray-400"
                        }`}
                      >
                        {isSatisfied ? "Fulfilled" : "Unfulfilled"}
                      </span>
                    </div>
                  </div>
                );
              }
            )}

            {/* Diversity, Civic Engagement, and Global Citizenship */}
            <div className="mt-4 mb-2 text-xs font-bold text-gray-500 uppercase">
              Diversity, Civic Engagement, and Global Citizenship
            </div>
            {[
              "The Individual in Community",
              "Global Citizenship and Intercultural Literacy",
              "Ethical Reasoning",
            ].map((hubArea) => {
              const isSatisfied = hubAreasSatisfied.has(hubArea);
              const note =
                hubArea === "Global Citizenship and Intercultural Literacy"
                  ? " (2 required)"
                  : "";
              return (
                <div
                  key={hubArea}
                  className={`grid grid-cols-12 gap-2 py-3 border-b border-gray-100 items-center ${
                    isSatisfied ? "bg-green-50" : "bg-gray-50"
                  } rounded px-2`}
                >
                  <div className="col-span-1 flex justify-center">
                    {isSatisfied ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                  <div className="col-span-7">
                    <span
                      className={`text-sm ${
                        isSatisfied
                          ? "font-medium text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {hubArea}
                      {note}
                    </span>
                  </div>
                  <div className="col-span-4 text-center">
                    <span
                      className={`text-sm font-bold ${
                        isSatisfied ? "text-green-700" : "text-gray-400"
                      }`}
                    >
                      {isSatisfied ? "Fulfilled" : "Unfulfilled"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Communication */}
            <div className="mt-4 mb-2 text-xs font-bold text-gray-500 uppercase">
              Communication
            </div>
            {[
              "First-Year Writing Seminar",
              "Writing, Research, and Inquiry",
              "Writing-Intensive Course",
              "Oral and/or Signed Communication",
              "Digital/Multimedia Expression",
            ].map((hubArea) => {
              const isSatisfied = hubAreasSatisfied.has(hubArea);
              const note =
                hubArea === "Writing-Intensive Course" ? " (2 required)" : "";
              return (
                <div
                  key={hubArea}
                  className={`grid grid-cols-12 gap-2 py-3 border-b border-gray-100 items-center ${
                    isSatisfied ? "bg-green-50" : "bg-gray-50"
                  } rounded px-2`}
                >
                  <div className="col-span-1 flex justify-center">
                    {isSatisfied ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                  <div className="col-span-7">
                    <span
                      className={`text-sm ${
                        isSatisfied
                          ? "font-medium text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {hubArea}
                      {note}
                    </span>
                  </div>
                  <div className="col-span-4 text-center">
                    <span
                      className={`text-sm font-bold ${
                        isSatisfied ? "text-green-700" : "text-gray-400"
                      }`}
                    >
                      {isSatisfied ? "Fulfilled" : "Unfulfilled"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Intellectual Toolkit */}
            <div className="mt-4 mb-2 text-xs font-bold text-gray-500 uppercase">
              Intellectual Toolkit
            </div>
            {[
              "Critical Thinking",
              "Research and Information Literacy",
              "Teamwork/Collaboration",
              "Creativity/Innovation",
            ].map((hubArea) => {
              const isSatisfied = hubAreasSatisfied.has(hubArea);
              return (
                <div
                  key={hubArea}
                  className={`grid grid-cols-12 gap-2 py-3 border-b border-gray-100 items-center ${
                    isSatisfied ? "bg-green-50" : "bg-gray-50"
                  } rounded px-2`}
                >
                  <div className="col-span-1 flex justify-center">
                    {isSatisfied ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                  <div className="col-span-7">
                    <span
                      className={`text-sm ${
                        isSatisfied
                          ? "font-medium text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {hubArea} (2 required)
                    </span>
                  </div>
                  <div className="col-span-4 text-center">
                    <span
                      className={`text-sm font-bold ${
                        isSatisfied ? "text-green-700" : "text-gray-400"
                      }`}
                    >
                      {isSatisfied ? "Fulfilled" : "Unfulfilled"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Semester by Semester */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Semester Timeline
        </h3>
        <div className="space-y-4">
          {semesters.map((semester, index) => {
            const semesterCredits = semester.courses.reduce(
              (sum, c) => sum + c.credits,
              0
            );

            return (
              <div key={semester.id} className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    semester.courses.length > 0
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
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
                      ? "No courses planned"
                      : `${semester.courses.length} courses • ${semesterCredits} credits`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Message */}
      {overallProgress > 0 && (
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 text-center">
          <div className="text-3xl mb-2">
            {overallProgress < 25
              ? "🌱"
              : overallProgress < 50
              ? "🌿"
              : overallProgress < 75
              ? "🌳"
              : "🎓"}
          </div>
          <div className="text-xl font-bold text-gray-900 mb-2">
            {overallProgress < 25 && "You're just getting started! Keep going!"}
            {overallProgress >= 25 &&
              overallProgress < 50 &&
              "Great progress! You're building momentum!"}
            {overallProgress >= 50 &&
              overallProgress < 75 &&
              "Halfway there! Stay focused!"}
            {overallProgress >= 75 &&
              overallProgress < 100 &&
              "Almost done! The finish line is in sight!"}
            {overallProgress >= 100 &&
              "Congratulations! You're ready to graduate! 🎉"}
          </div>
          <div className="text-gray-700">
            {remainingCredits > 0
              ? `${remainingCredits} credits remaining to complete your degree`
              : "You have enough credits to graduate!"}
          </div>
        </div>
      )}
    </div>
  );
}
