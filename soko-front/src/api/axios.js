import axios from 'axios'


// Special drone that is used to make API calls to the backend. 
// It is configured with a base URL and a request interceptor that attaches the JWT token to every request if it exists in localStorage. 
// This allows for seamless authentication with the backend without having to manually attach the token to each request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
})

let refreshRequest = null
const isAuthRequest = url => /\/(login|register|refresh)(?:[/?]|$)/.test(url || '')

/*
 * Request Interceptor
 * Runs before every request is sent.
 * We read the JWT token from localStorage and attach it
 * to the Authorization header in the Bearer token format.
 *
 * Spring Security reads this header to identify and
 * authenticate the user on the backend.
 */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token && !isAuthRequest(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthRequest(originalRequest.url)) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refreshToken')
    let user
    try {
      user = JSON.parse(localStorage.getItem('customer') || 'null')
    } catch {
      user = null
    }
    if (!refreshToken || !user?.role) return Promise.reject(error)

    originalRequest._retry = true
    if (!refreshRequest) {
      const refreshPath = user.role === 'ADMIN' ? '/admin/auth/refresh' : '/customers/refresh'
      refreshRequest = axios.post(`${api.defaults.baseURL}${refreshPath}`, { refreshToken })
        .then(({ data }) => {
          localStorage.setItem('token', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          return data
        })
        .catch(refreshError => {
          localStorage.removeItem('customer')
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.dispatchEvent(new Event('auth:expired'))
          throw refreshError
        })
        .finally(() => {
          refreshRequest = null
        })
    }

    try {
      const data = await refreshRequest
      originalRequest.headers = originalRequest.headers || {}
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)

export default api