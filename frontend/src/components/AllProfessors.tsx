import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Search, Filter, Loader, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Professor {
  oaid: string;
  emp_name: string;
  primary_department: string;
  primary_role: string;
  joint_department?: string;
}

export default function AllProfessors() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const navigate = useNavigate();

  useEffect(() => {
    loadProfessors();
  }, []);

  useEffect(() => {
    filterAndSortProfessors();
  }, [searchTerm, selectedDepartment, sortBy, professors]);

  const loadProfessors = async () => {
    try {
      // Load ALL professors without department filter
      const response = await api.get("/api/professors/");
      console.log("Loaded professors:", response.data.professors.length);
      setProfessors(response.data.professors);
    } catch (error) {
      console.error("Error loading professors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProfessors = () => {
    console.log("Filtering with:", {
      searchTerm,
      selectedDepartment,
      total: professors.length,
    });

    let filtered = professors.filter((prof) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        prof.emp_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.primary_department
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        prof.joint_department
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        prof.primary_role?.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchesDepartment =
        selectedDepartment === "all" ||
        prof.primary_department === selectedDepartment ||
        prof.joint_department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return (a.emp_name || "").localeCompare(b.emp_name || "");
      } else if (sortBy === "department") {
        return (a.primary_department || "").localeCompare(
          b.primary_department || ""
        );
      } else if (sortBy === "role") {
        return (a.primary_role || "").localeCompare(b.primary_role || "");
      }
      return 0;
    });

    console.log("Filtered results:", filtered.length);
    setFilteredProfessors(filtered);
  };

  const getDepartments = () => {
    const depts = new Set<string>();
    professors.forEach((prof) => {
      if (prof.primary_department) depts.add(prof.primary_department);
      if (prof.joint_department) depts.add(prof.joint_department);
    });
    return ["all", ...Array.from(depts).sort()];
  };

  const handleProfessorClick = (professor: Professor) => {
    // Navigate to professor detail page - adjust route as needed
    navigate(`/professor/${encodeURIComponent(professor.emp_name)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader
            className="animate-spin text-red-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-gray-600">Loading professors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-red-600 hover:text-red-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            All Professors
          </h1>
          <p className="text-gray-600">
            Browse {professors.length} faculty members
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search professors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {getDepartments().map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="department">Sort by Department</option>
              <option value="role">Sort by Role</option>
            </select>
          </div>

          <p className="text-sm text-gray-600">
            Showing {filteredProfessors.length} of {professors.length}{" "}
            professors
          </p>
        </div>

        {/* Professor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessors.map((prof) => (
            <button
              key={`${prof.oaid}-${prof.emp_name}`}
              onClick={() => handleProfessorClick(prof)}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all text-left border-2 border-gray-200 hover:border-red-600"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {prof.emp_name}
              </h3>
              <p className="text-red-600 mb-1 font-medium">
                {prof.primary_department || "N/A"}
              </p>
              {prof.joint_department && (
                <p className="text-purple-600 text-sm mb-1">
                  Joint: {prof.joint_department}
                </p>
              )}
              <p className="text-gray-600 text-sm">
                {prof.primary_role || "Faculty"}
              </p>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredProfessors.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-gray-200">
            <p className="text-gray-600 text-lg mb-4">
              No professors found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDepartment("all");
              }}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
