import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface Semester {
  id: string
  name: string
  year: number
  season: 'Fall' | 'Spring' | 'Summer'
  courses: Course[]
}

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

export const exportToPDF = (semesters: Semester[], studentName: string = 'Student') => {
  const doc = new jsPDF()
  doc.setFontSize(20)
  doc.setTextColor(204, 0, 0)
  doc.text('BU Course Plan', 105, 20, { align: 'center' })
  doc.save(`BU_Course_Plan_${new Date().toISOString().split('T')[0]}.pdf`)
}

export const exportToCalendar = (semesters: Semester[]) => {
  alert('Calendar export coming soon!')
}

export const generateShareLink = (semesters: Semester[]) => {
  const shareUrl = window.location.href
  navigator.clipboard.writeText(shareUrl)
  return shareUrl
}
