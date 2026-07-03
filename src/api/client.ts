import axios from 'axios'
import { clearAuthSession, getAuthToken } from '../utils/authStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://admin-moderator-backend-staging.up.railway.app/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
