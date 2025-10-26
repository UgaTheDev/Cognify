import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

/**
 * Call backend proxy for Google AI Studio / Gemini
 * Expects body: { prompt: string, model?: string }
 */
export async function callGemini(payload: { prompt: string; model?: string }) {
  return api.post('/api/gemini/', payload)
}
