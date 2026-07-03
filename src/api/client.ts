import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearAuthSession, getAuthToken } from '../utils/authStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const RETRYABLE_STATUSES = new Set([502, 503, 504])
const MAX_RETRIES = 2

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90_000,
})

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retryCount?: number }) | undefined
    const status = error.response?.status

    if (config && status && RETRYABLE_STATUSES.has(status)) {
      config._retryCount = (config._retryCount ?? 0) + 1
      if (config._retryCount <= MAX_RETRIES) {
        await sleep(config._retryCount * 2000)
        return api.request(config)
      }
    }

    if (status === 401) {
      clearAuthSession()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api
