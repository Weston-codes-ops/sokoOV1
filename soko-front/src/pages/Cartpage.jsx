/*
 * CartPage.jsx — Shopping Cart
 *
 * Shows all items in the current user's cart.
 * Protected route — must be logged in to access.
 *
 * Features:
 * - List of cart items with image, name, price, quantity
 * - Increase / decrease quantity per item
 * - Remove item button
 * - Order summary with total
 * - Proceed to checkout button
 *
 * Cart data is fetched from GET /cart on mount.
 * Updates (quantity change, remove) call the backend
 * and then re-fetch the cart to reflect the change.
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function CartPage() {
  const [cart, setCart]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null) // tracks which item is being updated
  const navigate = useNavigate()

  // Fetch cart on mount
  const fetchCart = () => {
    api.get('/cart')
      .then(res => setCart(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCart() }, [])

  const updateQuantity = async (productId, qty) => {
    if (qty < 1) return
    setUpdating(productId)
    try {
      await api.put(`/cart/items/${productId}`, null, { params: { quantity: qty } })
      fetchCart()
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (productId) => {
    setUpdating(productId)
    try {
      await api.delete(`/cart/items/${productId}`)
      fetchCart()
    } finally {
      setUpdating(null)
    }
  }

  // Calculate total from cart items
  const total = cart?.items?.reduce((sum, item) => sum + Number(item.subTotal || 0), 0) || 0
  const itemCount = cart?.items?.length || 0

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-8">

          <h1 className="text-xl font-extrabold text-gray-900 mb-6">Your Cart</h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-7 h-7 border-2 border-[#0f4c35] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : itemCount === 0 ? (
            // Empty cart state
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <ShoppingBag size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-500 mb-1">Your cart is empty</p>
              <p className="text-xs text-gray-400 mb-5">Add some products to get started</p>
              <Link to="/store"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f4c35] text-white text-sm font-semibold rounded-lg hover:bg-[#1a6b4a] transition-colors">
                Browse Store <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Cart Items ──────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-3">
                {cart.items.map(item => (
                  <div key={item.productId}
                    className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">

                    {/* Product image */}
                    <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                      {item.imageURL
                        ? <img src={item.imageURL} alt={item.productName}
                            className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={16} className="text-gray-200" />
                          </div>
                      }
                    </div>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        KSh {Number(item.unitPrice).toLocaleString()} each
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={updating === item.productId || item.quantity <= 1}
                        className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                        <Minus size={11} />
                      </button>
                      <span className="px-3 py-1.5 text-xs font-semibold text-gray-900 border-x border-gray-200 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={updating === item.productId}
                        className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                        <Plus size={11} />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <p className="text-sm font-extrabold text-gray-900 w-24 text-right shrink-0">
                      KSh {Number(item.subTotal || 0).toLocaleString()}
                    </p>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      disabled={updating === item.productId}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* ── Order Summary ───────────────────────────────── */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
                  <h2 className="text-sm font-extrabold text-gray-900 mb-4">Order Summary</h2>

                  <div className="space-y-2.5 text-sm border-b border-gray-100 pb-4 mb-4">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Subtotal ({itemCount} items)</span>
                      <span>KSh {Number(total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Delivery</span>
                      <span className="text-[#0f4c35] font-medium">
                        {total >= 2000 ? 'Free' : 'KSh 200'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm font-extrabold text-gray-900 mb-5">
                    <span>Total</span>
                    <span>KSh {Number(total < 2000 ? total + 200 : total).toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full py-3 bg-[#0f4c35] hover:bg-[#1a6b4a] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    Proceed to Checkout <ArrowRight size={14} />
                  </button>

                  <Link to="/store"
                    className="block text-center text-xs text-gray-400 hover:text-[#0f4c35] mt-3 transition-colors">
                    Continue shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}