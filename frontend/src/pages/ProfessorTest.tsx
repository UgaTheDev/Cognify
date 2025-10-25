import ProfessorResearch from '../components/ProfessorResearch'

export default function ProfessorTest() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Professor Research Explorer</h1>
        <p className="text-gray-600">Explore CS professors and their research</p>
      </div>
      
      <ProfessorResearch courseCode="CS 540" courseName="Artificial Intelligence" />
    </div>
  )
}
