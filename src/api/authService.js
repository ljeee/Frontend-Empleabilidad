import { api, clearAuthStorage, setAuthTokens } from './axiosConfig'

const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password })
  const payload = normalizeAuthPayload(data)
  setAuthTokens(payload)
  return payload
}

const register = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password })
  const payload = normalizeAuthPayload(data)
  setAuthTokens(payload)
  return payload
}

const refreshToken = async (refreshTokenValue) => {
  const { data } = await api.post('/auth/refresh', { refresh_token: refreshTokenValue })
  const payload = normalizeAuthPayload(data)
  setAuthTokens(payload)
  return payload
}

const logout = () => {
  clearAuthStorage()
}

const normalizeAuthPayload = (responseBody) => {
  // Manejar respuesta envuelta por ResponseInterceptor del backend
  const data = responseBody?.data || responseBody

  const accessToken = data?.accessToken || data?.access_token || data?.token || ''
  const refreshToken = data?.refreshToken || ''
  const user = data?.user || null
  return { accessToken, refreshToken, user }
}

export { login, logout, register, refreshToken }
