import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-white font-bold text-xl">
                BU Course Planner
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "bg-red-800 text-white"
                    : "text-white hover:bg-red-800"
                }`}
              >
                Home
              </Link>
              <Link
                to="/explorer"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/explorer")
                    ? "bg-red-800 text-white"
                    : "text-white hover:bg-red-800"
                }`}
              >
                Explorer
              </Link>
              <Link
                to="/planner"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/planner")
                    ? "bg-red-800 text-white"
                    : "text-white hover:bg-red-800"
                }`}
              >
                Planner
              </Link>
              <Link
                to="/professors"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/professors")
                    ? "bg-red-800 text-white"
                    : "text-white hover:bg-red-800"
                }`}
              >
                Professors
              </Link>
              <Link
                to="/progress"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/progress")
                    ? "bg-red-800 text-white"
                    : "text-white hover:bg-red-800"
                }`}
              >
                Progress
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-10 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
