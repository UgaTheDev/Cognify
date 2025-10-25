import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Planner from './pages/Planner'
import Explorer from './pages/Explorer'
import Progress from './pages/Progress'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold hover:text-gray-200">
              BU Course Planner
            </Link>
            <div className="flex gap-6">
              <Link to="/" className="hover:text-gray-200 transition-colors">
                Home
              </Link>
              <Link to="/explorer" className="hover:text-gray-200 transition-colors">
                Explorer
              </Link>
              <Link to="/planner" className="hover:text-gray-200 transition-colors">
                Planner
              </Link>
              <Link to="/progress" className="hover:text-gray-200 transition-colors">
                Progress
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
