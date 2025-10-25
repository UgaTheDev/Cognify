import { useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import type { Node, Edge } from 'reactflow'
import 'reactflow/dist/style.css'

interface Course {
  id: string
  code: string
  title: string
  prerequisites: {
    required: string[]
    recommended: string[]
  }
}

interface PrerequisiteFlowProps {
  course: Course
  allCourses: Course[]
}

export default function PrerequisiteFlow({ course, allCourses }: PrerequisiteFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    const processedCourses = new Set<string>()
    const coursesByLevel = new Map<number, string[]>()

    const findCourse = (code: string) => 
      allCourses.find(c => c.code === code)

    const buildTree = (currentCourse: Course, level: number) => {
      if (processedCourses.has(currentCourse.code)) return
      processedCourses.add(currentCourse.code)

      if (!coursesByLevel.has(level)) {
        coursesByLevel.set(level, [])
      }
      coursesByLevel.get(level)!.push(currentCourse.code)

      const prereqs = currentCourse.prerequisites.required
      prereqs.forEach((prereqCode) => {
        const prereqCourse = findCourse(prereqCode)
        if (prereqCourse) {
          newEdges.push({
            id: `${prereqCode}-${currentCourse.code}`,
            source: prereqCode,
            target: currentCourse.code,
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: level === 0 ? '#CC0000' : '#60A5FA',
              strokeWidth: 3 
            },
            markerEnd: {
              type: 'arrowclosed',
              color: level === 0 ? '#CC0000' : '#60A5FA',
              width: 20,
              height: 20,
            },
          })
          buildTree(prereqCourse, level + 1)
        }
      })
    }

    buildTree(course, 0)

    // Position nodes in a tree layout
    const maxLevel = Math.max(...Array.from(coursesByLevel.keys()))
    coursesByLevel.forEach((courseCodes, level) => {
      const y = (maxLevel - level) * 180
      const totalWidth = (courseCodes.length - 1) * 280
      const startX = 400 - totalWidth / 2

      courseCodes.forEach((code, index) => {
        const x = startX + index * 280
        const courseData = findCourse(code)
        
        if (courseData) {
          const isTarget = level === 0
          
          newNodes.push({
            id: code,
            data: { 
              label: (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className={`font-bold text-lg mb-1 ${isTarget ? 'text-white' : 'text-gray-900'}`}>
                    {code}
                  </div>
                  <div className={`text-xs text-center px-2 ${isTarget ? 'text-red-100' : 'text-gray-600'}`}>
                    {courseData.title.length > 40 
                      ? courseData.title.substring(0, 40) + '...'
                      : courseData.title
                    }
                  </div>
                </div>
              )
            },
            position: { x, y },
            style: {
              background: isTarget 
                ? 'linear-gradient(135deg, #CC0000 0%, #990000 100%)'
                : 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
              border: isTarget ? '3px solid #CC0000' : '3px solid #E5E7EB',
              borderRadius: '16px',
              padding: '20px',
              width: 220,
              height: 100,
              boxShadow: isTarget 
                ? '0 10px 40px rgba(204, 0, 0, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          })
        }
      })
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [course, allCourses, setNodes, setEdges])

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 shadow-inner overflow-hidden">
      {/* Legend - Now positioned absolutely at top */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-red-600 to-red-700 border border-red-800"></div>
            <span className="font-medium text-gray-700">Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-white border-2 border-gray-300"></div>
            <span className="font-medium text-gray-700">Prerequisites</span>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        attributionPosition="bottom-right"
        minZoom={0.5}
        maxZoom={1.5}
        preventScrolling={false}
        panOnScroll={false}
        zoomOnScroll={false}
      >
        <Background 
          color="#94a3b8" 
          gap={20} 
          size={1}
        />
        <Controls 
          className="!absolute !bottom-4 !left-4 bg-white rounded-lg shadow-lg border border-gray-200"
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={(node) => {
            return node.style?.background?.toString().includes('CC0000') 
              ? '#CC0000' 
              : '#E5E7EB'
          }}
          maskColor="rgba(255, 255, 255, 0.8)"
          className="!absolute !bottom-4 !right-4 bg-white rounded-lg border-2 border-gray-200 shadow-lg"
          style={{ width: 120, height: 80 }}
        />
      </ReactFlow>
    </div>
  )
}
