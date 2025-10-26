import { api } from './api'

export const coursesService = {
  getAllCourses: async () => {
    const response = await api.get('/api/courses/')
    return response.data
  },

  getCourseByCode: async (code: string) => {
    const response = await api.get(`/api/courses/${code}`)
    return response.data
  },

  searchCourses: async (query: string) => {
    const response = await api.get('/api/courses/search/', {
      params: { q: query }
    })
    return response.data
  },

  getSchools: async () => {
    const response = await api.get('/api/schools/')
    return response.data
  },

  getDepartments: async () => {
    const response = await api.get('/api/departments/')
    return response.data
  },

  getDepartmentsBySchool: async (school: string) => {
    const response = await api.get(`/api/departments/${school}`)
    return response.data
  },
}
