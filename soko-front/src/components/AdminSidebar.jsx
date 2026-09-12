import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Grid, Package, Percent, LogOut, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navigationItems = [
  { label: 'Dashboard', to: '/hidden-admin/dashboard', icon: Home },
  { label: 'Products', to: '/hidden-admin/products', icon: ShoppingBag },
  { label: 'Categories', to: '/hidden-admin/categories', icon: Grid },
  { label: 'Orders', to: '/hidden-admin/orders', icon: Package },
  { label: 'Promotions', to: '/hidden-admin/promotions', icon: Percent },
]

export default function AdminSidebar() {
  const location = useLocation()
  const { logout, user } = useAuth()

  return (
    <div className="w-64 bg-[#0f4c35] text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-white/20">
        <h2 className="text-xl font-bold">SokoOnline Admin</h2>
        {user && (
          <p className="text-white/70 text-sm mt-1">Signed in as {user.email}</p>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-[#f59e0b] text-white font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/20">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  )
}