import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const mealApi = {
  // Get meal recommendations
  getRecommendations: async (userData) => {
    try {
      console.log('Sending request to:', API_BASE_URL + '/recommendations')
      console.log('Request data:', userData)
      const response = await apiClient.post('/recommendations', userData)
      console.log('Response:', response.data)
      return response.data
    } catch (error) {
      console.error('API Error:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to generate meal plan'
      throw new Error(errorMsg)
    }
  },

  // Search for meals
  searchMeals: async (query) => {
    try {
      const response = await apiClient.get('/meals/search', { params: { q: query } })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search meals')
    }
  },

  // Get health check
  getHealth: async () => {
    try {
      const response = await apiClient.get('/health')
      return response.data
    } catch (error) {
      throw new Error('Backend is not available')
    }
  },

  // Get app info
  getInfo: async () => {
    try {
      const response = await apiClient.get('/info')
      return response.data
    } catch (error) {
      throw new Error('Failed to get app info')
    }
  },
}

export default apiClient
