export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-bu-red mb-4">
        BU Course Planner
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Plan your path to graduation with an interactive course planning tool.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">📚 Explore Courses</h2>
          <p className="text-gray-600">Browse all Computer Science courses</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">📅 Plan Semesters</h2>
          <p className="text-gray-600">Drag and drop courses into semesters</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">✅ Track Progress</h2>
          <p className="text-gray-600">Visualize your degree completion</p>
        </div>
      </div>
    </div>
  )
}
