import { Plus, Trash2, Download, Calendar, Share2 } from "lucide-react";
import { usePlannerStore } from "../store/plannerStore";
import { useState } from "react";
import {
  exportToPDF,
  exportToCalendar,
  generateShareLink,
} from "../utils/exportPlan";

export default function PlannerControls() {
  const { addNewSemester, clearAllCourses, semesters } = usePlannerStore();
  const [showAddSemester, setShowAddSemester] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [newYear, setNewYear] = useState(2026);
  const [newSeason, setNewSeason] = useState<"Fall" | "Spring" | "Summer">(
    "Fall"
  );

  const handleAddSemester = () => {
    addNewSemester(newYear, newSeason);
    setShowAddSemester(false);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all courses from your plan?")) {
      clearAllCourses();
    }
  };

  const handleExportPDF = () => {
    exportToPDF(semesters, "BU Student");
  };

  const handleExportCalendar = () => {
    exportToCalendar(semesters);
  };

  const handleShare = () => {
    const url = generateShareLink(semesters);
    setShareUrl(url);
    setShowShareLink(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddSemester(!showAddSemester)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Semester
          </button>

          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Trash2 size={18} />
            Clear All
          </button>

          <div className="border-l border-gray-300 h-8 mx-2"></div>

          <div className="ml-auto text-sm text-gray-600">
            {semesters.length} semesters •{" "}
            {semesters.reduce((sum, s) => sum + s.courses.length, 0)} courses
          </div>
        </div>
      </div>

      {/* Add Semester Modal */}
      {showAddSemester && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add New Semester</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Season</label>
                <select
                  value={newSeason}
                  onChange={(e) => setNewSeason(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Year</label>
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddSemester(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSemester}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
                >
                  Add Semester
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Link Modal */}
      {showShareLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Share Your Plan</h3>
            <p className="text-sm text-gray-600 mb-4">
              Link copied to clipboard! Share this URL:
            </p>
            <div className="bg-gray-100 p-3 rounded-lg mb-4 break-all text-sm">
              {shareUrl}
            </div>
            <button
              onClick={() => setShowShareLink(false)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
