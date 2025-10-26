import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Sparkles,
  GraduationCap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Welcome to Cognify
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Plan Your Academic Journey
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore courses, connect with professors, and build your perfect
          schedule at Boston University
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Course Explorer Card */}
        <Link
          to="/explorer"
          className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border-2 border-transparent hover:border-red-600 group"
        >
          <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <BookOpen className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Course Explorer
          </h3>
          <p className="text-gray-600 mb-4">
            Browse through 6000+ CS courses with detailed descriptions,
            prerequisites, and requirements
          </p>
          <span className="text-red-600 font-medium group-hover:underline">
            Explore Courses →
          </span>
        </Link>

        {/* Professors Card */}
        <Link
          to="/professors"
          className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border-2 border-transparent hover:border-red-600 group"
        >
          <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <Users className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Browse Professors
          </h3>
          <p className="text-gray-600 mb-4">
            Discover 4000+ faculty members, explore their research, and connect
            with mentors
          </p>
          <span className="text-red-600 font-medium group-hover:underline">
            View Professors →
          </span>
        </Link>

        {/* Course Planner Card */}
        <Link
          to="/planner"
          className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border-2 border-transparent hover:border-red-600 group"
        >
          <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <Calendar className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Plan Your Schedule
          </h3>
          <p className="text-gray-600 mb-4">
            Build your semester schedule and visualize your academic pathway
          </p>
          <span className="text-red-600 font-medium group-hover:underline">
            Start Planning →
          </span>
        </Link>

        {/* Progress Tracker Card */}
        <Link
          to="/progress"
          className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border-2 border-transparent hover:border-red-600 group"
        >
          <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
            <TrendingUp className="w-7 h-7 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Track Progress
          </h3>
          <p className="text-gray-600 mb-4">
            Monitor your degree completion and stay on track for graduation
          </p>
          <span className="text-red-600 font-medium group-hover:underline">
            View Progress →
          </span>
        </Link>

        {/* AI Advisor Card */}
        <Link
          to="/planner"
          className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border-2 border-red-200 hover:border-red-600 group"
        >
          <div className="bg-red-200 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-300 transition-colors">
            <Sparkles className="w-7 h-7 text-red-700" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            AI Career Advisor
          </h3>
          <p className="text-gray-600 mb-4">
            Get personalized course recommendations based on your career goals
          </p>
          <span className="text-red-700 font-medium group-hover:underline">
            Get AI Advice →
          </span>
        </Link>

        {/* Research Network Card */}
        <Link
          to="/professors"
          className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border-2 border-indigo-200 hover:border-indigo-600 group"
        >
          <div className="bg-indigo-200 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-300 transition-colors">
            <GraduationCap className="w-7 h-7 text-indigo-700" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Research Network
          </h3>
          <p className="text-gray-600 mb-4">
            Explore professor collaborations and find research opportunities
          </p>
          <span className="text-indigo-700 font-medium group-hover:underline">
            Explore Network →
          </span>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          By the Numbers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">6000+</div>
            <div className="text-gray-600">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">4000+</div>
            <div className="text-gray-600">Faculty Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">100+</div>
            <div className="text-gray-600">Departments</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">24/7</div>
            <div className="text-gray-600">Access</div>
          </div>
        </div>
      </div>
    </div>
  );
}
