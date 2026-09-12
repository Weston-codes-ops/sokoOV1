import axios from 'axios'


// Special drone that is used to make API calls to the backend. 
// It is configured with a base URL and a request interceptor that attaches the JWT token to every request if it exists in localStorage. 
// This allows for seamless authentication with the backend without having to manually attach the token to each request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
})

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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api