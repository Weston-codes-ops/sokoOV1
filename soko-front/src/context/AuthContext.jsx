/*
 * AuthContext.jsx — Global Authentication State
 *
 * React Context lets us share state across the entire app
 * without passing props down through every component.
 *
 * This context stores:
 * - user     : the logged-in user object (name, email, role)
 * - token    : the JWT token string
 * - login()  : saves user + token to state AND localStorage
 * - logout() : clears everything
 *
 * localStorage is used so the user stays logged in after
 * a page refresh. When the app loads, we read from localStorage
 * to restore the session.
 *
 * Usage anywhere in the app:
 *   const { user, login, logout } = useAuth()
 */

import { createContext, useContext, useState } from 'react'

// 1. Create the context object
const AuthContext = createContext(null)

// 2. Provider component — wraps the entire app in App.jsx
export function AuthProvider({ children }) {

  // Initialise state from localStorage so session persists on refresh
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null
  })

  /*
   * login() — called after a successful POST /auth/login
   * Saves the user object and JWT token to both state and localStorage
   */
  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', jwtToken)
  }

  /*
   * logout() — clears everything
   * The user is redirected to /login or / in the component that calls this
   */
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // Convenience boolean — true if the user is logged in
  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Custom hook — shortcut for useContext(AuthContext)
export function useAuth() {
  return useContext(AuthContext)
}