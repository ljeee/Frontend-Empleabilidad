import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, logout as logoutRequest, register as registerRequest, refreshToken as refreshTokenRequest } from '../api/authService'
import { clearAuthStorage, getStoredUser, setAuthTokens, getStoredRefreshToken } from '../api/axiosConfig'

const AuthContext = createContext({
  user: null,
  loading: true,
  authenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser()
        const refreshToken = getStoredRefreshToken()
        
        // Si tenemos un refresh token, intentamos refrescar
        if (refreshToken) {
          try {
            const payload = await refreshTokenRequest(refreshToken)
            if (payload?.user) {
              setUserState(payload.user)
            } else if (storedUser) {
              // Si el refresh fue exitoso pero no devuelve user, usamos el almacenado
              setUserState(storedUser)
            }
          } catch (refreshError) {
            // Si el refresh falla, limpiamos el storage y seguimos sin usuario
            clearAuthStorage()
            setUserState(null)
          }
        } else if (storedUser) {
          // Si no hay refresh token pero sí hay usuario almacenado, lo recuperamos
          setUserState(storedUser)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUserState(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const payload = await loginRequest(email, password)
      if (payload?.user) {
        setUserState(payload.user)
      }
      return { success: true, user: payload?.user }
    } catch (error) {
      return Promise.reject(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    setLoading(true)
    try {
      const payload = await registerRequest(name, email, password)
      if (payload?.user) {
        setUserState(payload.user)
      }
      return { success: true, user: payload?.user }
    } catch (error) {
      return Promise.reject(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    logoutRequest()
    clearAuthStorage()
    setUserState(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      authenticated: Boolean(user),
      login,
      register,
      logout,
      setUser: (payload) => {
        if (payload) {
          setAuthTokens({ user: payload })
        }
        setUserState(payload)
      },
    }),
    [login, loading, logout, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
