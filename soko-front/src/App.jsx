/*
 * App.jsx — Root Component & Route Definitions
 *
 * This is the entry point of the React app (after main.jsx).
 * It sets up all the URL routes using React Router.
 *
 * How routing works:
 * - BrowserRouter    : enables URL-based navigation
 * - Routes           : container for all route definitions
 * - Route            : maps a URL path to a component
 *
 * Protected routes use a ProtectedRoute wrapper that checks
 * if the user is logged in before rendering the page.
 * If not logged in, it redirects to /login.
 *
 * Admin routes additionally check if user.role === 'ADMIN'.
 * If a non-admin tries to access /admin/*, they get redirected.
 */

import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { getAdminRedirectUrl, isAdminSubdomain } from './utils/adminDomain'
import Loading from './components/Loading'

// ── Page imports ──────────────────────────────────────────────────
import Homepage          from './pages/Homepage'
import Storepage      from './pages/Storepage'
import Cartpage          from './pages/Cartpage'
import Aboutpage         from './pages/Aboutpage'
import FAQpage           from './pages/FAQpage'
import Loginpage         from './pages/Auth/Loginpage'
import Registerpage      from './pages/Auth/Registerpage'


/*
 * ProtectedRoute — Guards pages that require login
 *
 * Props:
 * - children  : the page component to render if allowed
 * - adminOnly : if true, also requires ADMIN role
 *
 * Usage:
 *   <ProtectedRoute><CartPage /></ProtectedRoute>
 *   <ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, user } = useAuth()

  // Not logged in → redirect to login page
  if (!isLoggedIn) return <Navigate to="/login" replace />

  // Logged in but not admin → redirect to home
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/" replace />

  return children
}

function AdminRoute({ children }) {
  const location = useLocation()

  useEffect(() => {
    if (!isAdminSubdomain()) {
      const redirectUrl = getAdminRedirectUrl(location.pathname, location.search)
      if (redirectUrl) {
        window.location.replace(redirectUrl)
      }
    }
  }, [location.pathname, location.search])

  if (!isAdminSubdomain()) {
    return null
  }

  return children
}

/*
 * AppRoutes — Defines all routes in the app
 * Separated from App so we can use useAuth() inside
 * (hooks must be inside the AuthProvider tree)
 */
function AppRoutes() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      {isLoading && <Loading />}
      
      <Routes>
        {/* ── Public routes — anyone can access ─────────────────── */}
        <Route path="/"        element={<Homepage />} />
        <Route path="/store"   element={<Storepage />} />
        <Route path="/login"   element={<Loginpage />} />
        <Route path="/register" element={<Registerpage />} />
        <Route path="/cart"    element={<Cartpage />} />
        <Route path="/about"   element={<Aboutpage />} />
        <Route path="/faqs"    element={<FAQpage />} />
        

        {/* ── Protected routes — must be logged in ──────────────── */}
        <Route path="/cart" element={
          <ProtectedRoute><Cartpage /></ProtectedRoute>
        } />
    
   {/*
  ── Hidden admin routes — only reachable on the admin host ─────
  <Route path="/hidden-admin/dashboard" element={
    <AdminRoute>
      <ProtectedRoute adminOnly>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </ProtectedRoute>
    </AdminRoute>
  } />

  <Route path="/hidden-admin/products" element={
    <AdminRoute>
      <ProtectedRoute adminOnly>
        <AdminLayout>
          <AdminProductsPage />
        </AdminLayout>
      </ProtectedRoute>
    </AdminRoute>
  } />

  <Route path="/hidden-admin/categories" element={
    <AdminRoute>
      <ProtectedRoute adminOnly>
        <AdminLayout>
          <AdminCategoriesPage />
        </AdminLayout>
      </ProtectedRoute>
    </AdminRoute>
  } />

  <Route path="/hidden-admin/orders" element={
    <AdminRoute>
      <ProtectedRoute adminOnly>
        <AdminLayout>
          <AdminOrdersPage />
        </AdminLayout>
      </ProtectedRoute>
    </AdminRoute>
  } />

  <Route path="/hidden-admin/promotions" element={
    <AdminRoute>
      <ProtectedRoute adminOnly>
        <AdminLayout>
          <AdminPromotionsPage />
        </AdminLayout>
      </ProtectedRoute>
    </AdminRoute>
  } />
*/}
      

        {/* ── Catch-all — redirect unknown URLs to home ─────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </>
  )
}

/*
 * App — Top level component
 * Wraps everything in:
 * 1. BrowserRouter  : enables React Router navigation
 * 2. AuthProvider   : makes auth state available everywhere
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}