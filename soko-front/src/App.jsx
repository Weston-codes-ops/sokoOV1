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
 * if the customer is logged in before rendering the page.
 * If not logged in, it redirects to /login.
 *
 * Admin routes additionally check if customer.role === 'ADMIN'.
 * If a non-admin tries to access /admin/*, they get redirected.
 */

import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { getAdminRedirectUrl, isAdminSubdomain } from './utils/adminDomain'

// ── Page imports ──────────────────────────────────────────────────
import Homepage          from './pages/Homepage'
import Storepage      from './pages/Storepage'
import Cartpage          from './pages/Cartpage'
import Aboutpage         from './pages/Aboutpage'
import FAQpage           from './pages/FAQpage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminLayout       from './components/AdminLayout'
import Registerpage      from './pages/Auth/Registerpage'
import Loginpage         from './pages/Auth/Loginpage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminRegisterPage from './pages/admin/AdminRegisterPage'
import NotFound from './pages/util/Notfound'
import Loading from './components/Loading'


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
function ProtectedRoute({ children, adminOnly = false, customerOnly = false }) {
  const { isLoggedIn, customer } = useAuth()

  // Authentication routes are being replaced with OAuth.
  if (!isLoggedIn) return <Navigate to={adminOnly ? '/_market-ops/login' : '/login'} replace />

  // Logged in but not admin → redirect to home
  if (adminOnly && customer?.role !== 'ADMIN') return <Navigate to="/" replace />

  // Admins operate the shop and do not have customer profiles or carts.
  if (customerOnly && customer?.role !== 'USER') return <Navigate to="/" replace />

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

function RouteTransition({ children }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      {!loading && <div className="page-transition-content">{children}</div>}
      <Loading visible={loading} />
    </>
  )
}

/*
 * AppRoutes — Defines all routes in the app
 * Separated from App so we can use useAuth() inside
 * (hooks must be inside the AuthProvider tree)
 */
function AppRoutes() {
  const location = useLocation()

  return (
    <RouteTransition key={`${location.pathname}${location.search}`}>
      <main className="page-transition">
        <Routes>
        {/* ── Public routes — anyone can access ─────────────────── */}
        <Route path="/"        element={<Homepage />} />
        <Route path="/store"   element={<Storepage />} />
        <Route path="/about"   element={<Aboutpage />} />
        <Route path="/faqs"    element={<FAQpage />} />
        <Route path="/register" element={<Registerpage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/_market-ops/login" element={<AdminRoute><AdminLoginPage /></AdminRoute>} />
        <Route path="/_market-ops/admins-pvp" element={<AdminRoute><AdminRegisterPage /></AdminRoute>} />

        {/* ── Protected routes — must be logged in ──────────────── */}
        <Route path="/cart" element={
          <ProtectedRoute customerOnly><Cartpage /></ProtectedRoute>
        } />
    
        <Route path="/_market-ops/catalog" element={
          <AdminRoute>
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminProductsPage />
              </AdminLayout>
            </ProtectedRoute>
          </AdminRoute>
        } />

   {/*
  ── Reserved admin routes — only reachable on the admin host ────
  <Route path="/_market-ops/dashboard" element={
    <AdminRoute>
      <ProtectedRoute adminOnly>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </ProtectedRoute>
    </AdminRoute>
  } />

  <Route path="/_market-ops/products" element={
    <AdminRoute>
      <ProtectedRoute adminOnly>
        <AdminLayout>
          <AdminProductsPage />
        </AdminLayout>
      </ProtectedRoute>
    </AdminRoute>
  } />

  <Route path="/_market-ops/categories" element={
    <AdminRoute>
      <ProtectedRoute adminOnly>
        <AdminLayout>
          <AdminCategoriesPage />
        </AdminLayout>
      </ProtectedRoute>
    </AdminRoute>
  } />

  <Route path="/_market-ops/orders" element={
    <AdminRoute>
      <ProtectedRoute adminOnly>
        <AdminLayout>
          <AdminOrdersPage />
        </AdminLayout>
      </ProtectedRoute>
    </AdminRoute>
  } />

  <Route path="/_market-ops/promotions" element={
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
        <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </RouteTransition>
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