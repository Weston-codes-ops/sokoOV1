import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Minus, Package, Plus, ShoppingBag } from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductGrid from '../components/ProductGrid'
import { useAuth } from '../context/AuthContext'

export default function ProductDetailPage() {
  const { slug } = useParams()
  return <ProductDetail key={slug} slug={slug} />
}

function ProductDetail({ slug }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { customer } = useAuth()
  const [product, setProduct] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let active = true
    api.get(`/products/slug/${encodeURIComponent(slug)}`)
      .then(({ data }) => {
        if (active) setProduct(data)
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.status === 404
            ? 'We could not find that product.'
            : 'This product could not be loaded. Please try again.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [slug])

  useEffect(() => {
    let active = true
    api.get('/products?page=0&size=100')
      .then(({ data }) => {
        if (active) setCatalog(data.content ?? data ?? [])
      })
      .catch(() => {
        if (active) setCatalog([])
      })

    return () => { active = false }
  }, [])

  const relatedProducts = useMemo(() => {
    if (!product) return []
    const productCategories = new Set([...(product.categories ?? []), ...(product.subcategories ?? [])])
    const otherProducts = catalog.filter(item => item.id !== product.id && item.stockQuantity > 0)
    const related = productCategories.size
      ? otherProducts.filter(item =>
          [...(item.categories ?? []), ...(item.subcategories ?? [])].some(category => productCategories.has(category)))
      : []
    return (related.length ? related : otherProducts).slice(0, 4)
  }, [catalog, product])

  const addToCart = async () => {
    if (!customer || customer.role !== 'USER') {
      navigate('/login', { state: { returnTo: location.pathname } })
      return
    }

    setAdding(true)
    setError('')
    setAdded(false)
    try {
      await api.post('/cart/items', { productId: product.id, quantity })
      setAdded(true)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not add this product to your cart. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  const inStock = Number(product?.stockQuantity) > 0
  const categories = [...(product?.categories ?? []), ...(product?.subcategories ?? [])]

  return (
    <div className="min-h-screen flex flex-col bg-surface-subtle">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
          <Link to="/store" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-brand-primary">
            <ArrowLeft size={16} /> Back to the shop
          </Link>

          {loading ? (
            <div className="grid animate-pulse gap-8 lg:grid-cols-2">
              <div className="aspect-square rounded-2xl bg-gray-100" />
              <div className="space-y-5 py-6">
                <div className="h-4 w-28 rounded bg-gray-100" />
                <div className="h-8 w-3/4 rounded bg-gray-100" />
                <div className="h-5 w-32 rounded bg-gray-100" />
                <div className="h-24 rounded bg-gray-100" />
              </div>
            </div>
          ) : error && !product ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
              <Package size={32} className="mx-auto mb-3 text-gray-300" />
              <h1 className="text-lg font-bold text-gray-900">{error}</h1>
              <Link to="/store" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover">
                Browse the shop <ArrowRight size={15} />
              </Link>
            </div>
          ) : product ? (
            <>
              <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white">
                  {product.imageURL
                    ? <img src={product.imageURL} alt={product.name} className="h-full w-full object-contain p-6 sm:p-10" />
                    : <ShoppingBag size={56} className="text-gray-200" />}
                </div>

                <div className="flex flex-col justify-center py-2">
                  {categories.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {categories.map(category => (
                        <span key={category} className="rounded-full bg-surface-tint px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary">
                          {category}
                        </span>
                      ))}
                    </div>
                  )}

                  <h1 className="text-3xl font-extrabold leading-tight text-gray-950 sm:text-4xl">{product.name}</h1>
                  <p className="mt-4 text-2xl font-extrabold text-brand-primary">
                    KSh {Number(product.price).toLocaleString()}
                  </p>

                  <div className="mt-5 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className={`text-sm font-semibold ${inStock ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {inStock
                        ? Number(product.stockQuantity) <= 5
                          ? `Only ${product.stockQuantity} left`
                          : 'In stock'
                        : 'Currently sold out'}
                    </span>
                  </div>

                  {product.description && (
                    <div className="mt-7 border-t border-gray-200 pt-6">
                      <h2 className="text-sm font-bold text-gray-900">About this product</h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-600">{product.description}</p>
                    </div>
                  )}

                  {error && product && (
                    <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
                  )}
                  {added && (
                    <p role="status" className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      <CheckCircle2 size={16} /> Added to your cart.
                      <Link to="/cart" className="font-bold underline underline-offset-2">View cart</Link>
                    </p>
                  )}

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <div className="inline-flex h-12 items-center justify-between rounded-lg border border-gray-200 bg-white sm:w-36">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(current => Math.max(1, current - 1))}
                        disabled={quantity <= 1 || !inStock}
                        className="flex h-full items-center px-4 text-gray-500 hover:text-brand-primary disabled:opacity-40">
                        <Minus size={15} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold text-gray-900">{quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(current => Math.min(Number(product.stockQuantity), current + 1))}
                        disabled={!inStock || quantity >= Number(product.stockQuantity)}
                        className="flex h-full items-center px-4 text-gray-500 hover:text-brand-primary disabled:opacity-40">
                        <Plus size={15} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={addToCart}
                      disabled={!inStock || adding}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 text-sm font-bold text-white transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
                      <ShoppingBag size={17} />
                      {adding ? 'Adding...' : customer?.role === 'USER' ? 'Add to cart' : 'Sign in to add to cart'}
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-400">
                    {customer?.role === 'USER'
                      ? 'Add this find to your SokoOnline cart.'
                      : 'Sign in to add this product to your cart.'}
                  </p>
                </div>
              </section>

              {relatedProducts.length > 0 && (
                <section className="mt-16 border-t border-gray-200 pt-10">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-accent">You might also like</p>
                      <h2 className="text-2xl font-extrabold text-gray-900">More from the collection</h2>
                    </div>
                    <Link to="/store" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-hover">
                      See all <ArrowRight size={15} />
                    </Link>
                  </div>
                  <ProductGrid products={relatedProducts} />
                </section>
              )}
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  )
}
