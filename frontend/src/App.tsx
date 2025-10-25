import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Explorer from './pages/Explorer'
import Planner from './pages/Planner'
import Progress from './pages/Progress'
import ProfessorTest from './pages/ProfessorTest'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/professors" element={<ProfessorTest />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
