import { create } from 'zustand'

export interface Course {
  id: string
  code: string
  title: string
  credits: number
  prerequisites: {
    required: string[]
    recommended: string[]
  }
  level: string
}

export interface Semester {
  id: string
  name: string
  year: number
  season: 'Fall' | 'Spring' | 'Summer'
  courses: Course[]
}

interface PlannerState {
  semesters: Semester[]
  addSemester: (semester: Semester) => void
  removeSemester: (semesterId: string) => void
  addCourseToSemester: (semesterId: string, course: Course) => void
  removeCourseFromSemester: (semesterId: string, courseId: string) => void
  moveCourse: (courseId: string, fromSemesterId: string, toSemesterId: string) => void
  getTotalCredits: (semesterId: string) => number
  getAllCompletedCourses: (beforeSemesterId: string) => string[]
  clearAllCourses: () => void
  addNewSemester: (year: number, season: 'Fall' | 'Spring' | 'Summer') => void
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  semesters: [
    { id: 'fall-2024', name: 'Fall 2024', year: 2024, season: 'Fall', courses: [] },
    { id: 'spring-2025', name: 'Spring 2025', year: 2025, season: 'Spring', courses: [] },
    { id: 'fall-2025', name: 'Fall 2025', year: 2025, season: 'Fall', courses: [] },
    { id: 'spring-2026', name: 'Spring 2026', year: 2026, season: 'Spring', courses: [] },
  ],

  addSemester: (semester) => set((state) => ({
    semesters: [...state.semesters, semester]
  })),

  removeSemester: (semesterId) => set((state) => ({
    semesters: state.semesters.filter(s => s.id !== semesterId)
  })),

  addCourseToSemester: (semesterId, course) => set((state) => {
    // Check if course already exists in any semester
    const existsInAnySemester = state.semesters.some(s => 
      s.courses.some(c => c.id === course.id)
    )
    
    if (existsInAnySemester) {
      alert(`${course.code} is already in your plan!`)
      return state
    }

    return {
      semesters: state.semesters.map(semester =>
        semester.id === semesterId
          ? { ...semester, courses: [...semester.courses, course] }
          : semester
      )
    }
  }),

  removeCourseFromSemester: (semesterId, courseId) => set((state) => ({
    semesters: state.semesters.map(semester =>
      semester.id === semesterId
        ? { ...semester, courses: semester.courses.filter(c => c.id !== courseId) }
        : semester
    )
  })),

  moveCourse: (courseId, fromSemesterId, toSemesterId) => set((state) => {
    const fromSemester = state.semesters.find(s => s.id === fromSemesterId)
    const course = fromSemester?.courses.find(c => c.id === courseId)
    
    if (!course) return state

    return {
      semesters: state.semesters.map(semester => {
        if (semester.id === fromSemesterId) {
          return { ...semester, courses: semester.courses.filter(c => c.id !== courseId) }
        }
        if (semester.id === toSemesterId) {
          return { ...semester, courses: [...semester.courses, course] }
        }
        return semester
      })
    }
  }),

  getTotalCredits: (semesterId) => {
    const semester = get().semesters.find(s => s.id === semesterId)
    return semester?.courses.reduce((sum, course) => sum + course.credits, 0) || 0
  },

  getAllCompletedCourses: (beforeSemesterId) => {
    const semesters = get().semesters
    const semesterIndex = semesters.findIndex(s => s.id === beforeSemesterId)
    
    const completedCourses: string[] = []
    for (let i = 0; i < semesterIndex; i++) {
      semesters[i].courses.forEach(course => {
        completedCourses.push(course.code)
      })
    }
    
    return completedCourses
  },

  clearAllCourses: () => set((state) => ({
    semesters: state.semesters.map(s => ({ ...s, courses: [] }))
  })),

  addNewSemester: (year, season) => set((state) => {
    const id = `${season.toLowerCase()}-${year}`
    const name = `${season} ${year}`
    
    return {
      semesters: [...state.semesters, { id, name, year, season, courses: [] }]
    }
  })
}))
