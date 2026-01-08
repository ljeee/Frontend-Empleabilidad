import { api, plainClient, apiKey, clearAuthStorage, setAuthTokens } from './axiosConfig'

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
  const { data } = await plainClient.post('/auth/refresh', { refresh_token: refreshTokenValue }, { headers: { 'x-api-key': apiKey } })
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

  const access_token = data?.access_token || data?.accessToken || data?.token || ''
  const refresh_token = data?.refresh_token || data?.refreshToken || ''
  const user = data?.user || null
  return { access_token, refresh_token, user }
}

export { login, logout, register, refreshToken }
