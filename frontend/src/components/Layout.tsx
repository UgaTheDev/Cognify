import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  Calendar,
  GraduationCap,
  TrendingUp,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/explorer", label: "Explorer", icon: Compass },
    { path: "/planner", label: "Planner", icon: Calendar },
    { path: "/professors", label: "Professors", icon: GraduationCap },
    { path: "/progress", label: "Progress", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation with Glass Effect */}
      <nav className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 backdrop-blur-lg border-b border-red-400/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl group-hover:bg-white/30 transition-all duration-300 group-hover:scale-105">
                <Sparkles className="text-white" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white tracking-tight">
                  Cognify
                </span>
                <span className="text-xs text-red-100 -mt-1">
                  BU Course Planner
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
                      transition-all duration-200
                      ${
                        active
                          ? "bg-white/25 text-white shadow-lg backdrop-blur-sm"
                          : "text-white/90 hover:text-white hover:bg-white/15"
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/15 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium 
                        transition-all duration-200
                        ${
                          active
                            ? "bg-white/25 text-white shadow-lg"
                            : "text-white/90 hover:text-white hover:bg-white/15"
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
