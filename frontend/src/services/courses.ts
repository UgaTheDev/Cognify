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
}
