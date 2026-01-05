import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const apiKey = import.meta.env.VITE_API_KEY

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const plainClient = axios.create({ baseURL })

let isRefreshing = false
let refreshQueue = []

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token)
    } else {
      reject(error)
    }
  })
  refreshQueue = []
}

const getStoredToken = () => localStorage.getItem('authToken')
const getStoredRefreshToken = () => localStorage.getItem('refreshToken')

api.interceptors.request.use((config) => {
  if (apiKey) {
    config.headers['x-api-key'] = apiKey
  }
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(error)
    }

    const refreshToken = getStoredRefreshToken()
    if (!refreshToken) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          originalRequest._retry = true
          return api(originalRequest)
        })
        .catch(Promise.reject)
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await plainClient.post('/auth/refresh', { refreshToken }, {
        headers: { 'x-api-key': apiKey },
      })
      const newToken = data?.accessToken
      if (newToken) {
        localStorage.setItem('authToken', newToken)
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      }
      processQueue(error, null)
      return Promise.reject(error)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuthStorage()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

const clearAuthStorage = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

const setAuthTokens = ({ accessToken, refreshToken, user }) => {
  if (accessToken) {
    localStorage.setItem('authToken', accessToken)
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken)
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

const getStoredUser = () => {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (error) {
    return null
  }
}

export { api, baseURL, clearAuthStorage, getStoredUser, setAuthTokens }
