import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, logout as logoutRequest, register as registerRequest } from '../api/authService'
import { clearAuthStorage, getStoredUser, setAuthTokens } from '../api/axiosConfig'

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
    const storedUser = getStoredUser()
    if (storedUser) {
      setUserState(storedUser)
    }
    setLoading(false)
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
