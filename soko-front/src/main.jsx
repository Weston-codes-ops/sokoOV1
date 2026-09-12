/*
 * main.jsx — Application Entry Point
 *
 * This is the very first file that runs.
 * It mounts the React app onto the HTML element with id="root"
 * in index.html.
 *
 * StrictMode is a React development tool that:
 * - Highlights potential problems in the app
 * - Runs certain checks and warnings in development only
 * - Has no effect in production builds
 */


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // Global styles including Tailwind
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)