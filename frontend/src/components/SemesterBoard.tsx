import { usePlannerStore } from "../store/plannerStore";
import {
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function SemesterBoard() {
  const {
    semesters,
    removeCourseFromSemester,
    getTotalCredits,
    getAllCompletedCourses,
  } = usePlannerStore();

  const validatePrerequisites = (course: any, semesterId: string) => {
    const completedCourses = getAllCompletedCourses(semesterId);
    const missingPrereqs = course.prerequisites.required.filter(
      (prereq: string) => !completedCourses.includes(prereq)
    );
    return missingPrereqs;
  };

  const getCreditColor = (credits: number) => {
    if (credits === 0) return "text-gray-500";
    if (credits < 12) return "text-yellow-600";
    if (credits > 18) return "text-red-600";
    return "text-green-600";
  };

  const getCreditWarning = (credits: number) => {
    if (credits === 0) return null;
    if (credits < 12)
      return {
        icon: AlertTriangle,
        text: "Below full-time (12 credits)",
        color: "yellow",
      };
    if (credits > 18)
      return {
        icon: AlertCircle,
        text: "Overload! Consider reducing",
        color: "red",
      };
    return { icon: CheckCircle, text: "Good load", color: "green" };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {semesters.map((semester) => {
          const totalCredits = getTotalCredits(semester.id);
          const warning = getCreditWarning(totalCredits);
          const WarningIcon = warning?.icon;

          return (
            <div
              key={semester.id}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden"
            >
              {/* Semester Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
                <h3 className="font-bold text-lg">{semester.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold">
                    <span
                      className={`bg-white rounded px-2 py-1 ${getCreditColor(
                        totalCredits
                      )}`}
                    >
                      {totalCredits} Credits
                    </span>
                  </span>
                  <span className="text-xs opacity-90">
                    {semester.courses.length} courses
                  </span>
                </div>
                {warning && WarningIcon && (
                  <div className="mt-2 flex items-center gap-1 text-xs bg-white/20 rounded px-2 py-1">
                    <WarningIcon size={14} />
                    <span>{warning.text}</span>
                  </div>
                )}
              </div>

              {/* Course List */}
              <div className="p-4 space-y-2 min-h-[300px] max-h-[500px] overflow-y-auto">
                {semester.courses.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                    <div className="text-center">
                      <Plus size={32} className="mx-auto mb-2 opacity-50" />
                      Add from Explorer
                    </div>
                  </div>
                ) : (
                  semester.courses.map((course) => {
                    const missingPrereqs = validatePrerequisites(
                      course,
                      semester.id
                    );
                    const hasError = missingPrereqs.length > 0;

                    return (
                      <div
                        key={course.id}
                        className={`p-3 rounded-lg border-2 ${
                          hasError
                            ? "bg-red-50 border-red-300"
                            : "bg-gray-50 border-gray-200"
                        } hover:shadow-md transition-all`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              {course.code}
                              {hasError ? (
                                <AlertCircle
                                  size={16}
                                  className="text-red-600"
                                />
                              ) : (
                                <CheckCircle
                                  size={16}
                                  className="text-green-600"
                                />
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {course.title.length > 30
                                ? course.title.substring(0, 30) + "..."
                                : course.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {course.credits} credits
                            </div>
                            {hasError && (
                              <div className="mt-2 text-xs text-red-600 font-medium">
                                Missing: {missingPrereqs.join(", ")}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              removeCourseFromSemester(semester.id, course.id)
                            }
                            className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-gray-700">Prerequisites met</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-gray-700">Missing prerequisites</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">12-18 credits</span>
            <span className="text-gray-700">= Full-time</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-600" />
            <span className="text-gray-700">&lt;12 credits = Part-time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
