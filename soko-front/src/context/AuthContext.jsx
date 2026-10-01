/*
 * AuthContext.jsx — Global Authentication State
 *
 * React Context lets us share state across the entire app
 * without passing props down through every component.
 *
 * This context stores:
 * - customer     : the logged-in customer object (name, email, role)
 * - token    : the JWT token string
 * - login()  : saves customer + token to state AND localStorage
 * - logout() : clears everything
 *
 * localStorage is used so the customer stays logged in after
 * a page refresh. When the app loads, we read from localStorage
 * to restore the session.
 *
 * Usage anywhere in the app:
 *   const { customer, login, logout } = useAuth()
 */

import { createContext, useContext, useEffect, useState } from 'react'

// 1. Create the context object
const AuthContext = createContext(null)

// 2. Provider component — wraps the entire app in App.jsx
export function AuthProvider({ children }) {

  // Initialise state from localStorage so session persists on refresh
  const [customer, setUser] = useState(() => {
    const stored = localStorage.getItem('customer')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null
  })

  useEffect(() => {
    const clearExpiredSession = () => {
      setUser(null)
      setToken(null)
    }
    window.addEventListener('auth:expired', clearExpiredSession)
    return () => window.removeEventListener('auth:expired', clearExpiredSession)
  }, [])

  /*
  * login() — called after a successful authentication callback
  * Saves the customer object and application JWT to state and localStorage
   */
  const login = (userData, jwtToken, refreshToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('customer', JSON.stringify(userData))
    localStorage.setItem('token', jwtToken)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
  }

  /*
   * logout() — clears everything
  * The caller decides where to navigate after signing out.
   */
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('customer')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  // Convenience boolean — true if the customer is logged in
  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ customer, token, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Custom hook — shortcut for useContext(AuthContext)
export function useAuth() {
  return useContext(AuthContext)
}