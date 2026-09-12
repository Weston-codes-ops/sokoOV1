import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Package, X, SlidersHorizontal } from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const [products, setProducts]           = useState([])
  const [categories, setCategories]       = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState(searchParams.get('search') || '')
  const [selectedCategories, setSelectedCategories]     = useState([])
  const [selectedSubcategories, setSelectedSubcategories] = useState([])
  const [page, setPage]             = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    params.append('page', 0)
    params.append('size', 500)
    api.get(`/products?${params}`)
      .then(res => {
        const list = res.data.content ?? res.data ?? []
        setProducts(list)

        const derivedCategories = Array.from(
          new Set(list.flatMap(product => product.categories ?? []))
        ).map((name, index) => ({ id: name, name, __order: index }))

        const derivedSubcategories = Array.from(
          new Set(list.flatMap(product => product.subcategories ?? []))
        ).map((name, index) => ({ id: name, name, categoryId: 'General', __order: index }))

        setCategories(derivedCategories)
        setSubcategories(derivedSubcategories)
      })
      .catch(() => {
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [search])

  const subsForCat     = (catId) => subcategories.filter(s => s.categoryId === catId)
  const selectedCatObj = categories.filter(c => selectedCategories.includes(c.id))
  const selectedSubObj = subcategories.filter(s => selectedSubcategories.includes(s.id))
  const hasFilters     = search || selectedCategories.length > 0 || selectedSubcategories.length > 0

  const displayProducts = products
    .filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.categoryId))
    .filter(p => selectedSubcategories.length === 0 || selectedSubcategories.includes(p.subcategoryId))
  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(displayProducts.length / pageSize))
  const pagedProducts = displayProducts.slice(page * pageSize, (page + 1) * pageSize)

  const clearFilters = () => {
    setSearch('')
    setSelectedCategories([])
    setSelectedSubcategories([])
    setPage(0)
  }

  const handleCategoryChange = (catId) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(catId)
      const next = isSelected ? prev.filter(id => id !== catId) : [...prev, catId]
      if (isSelected) {
        setSelectedSubcategories(prevSubs => prevSubs.filter(subId => {
          const sub = subcategories.find(s => s.id === subId)
          return sub?.categoryId !== catId
        }))
      }
      return next
    })
    setPage(0)
  }

  const handleSubChange = (subId, catId) => {
    setSelectedSubcategories(prev => (
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    ))
    setSelectedCategories(prev => prev.includes(catId) ? prev : [...prev, catId])
    setPage(0)
  }

  const gridClasses = 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'

  return (
    <div className="min-h-screen flex flex-col bg-[#f7faf6]">
      <Navbar />

      <div className="flex flex-1 overflow-hidden min-h-0">

        <aside className={`
          ${sidebarOpen ? 'fixed inset-0 z-40 bg-black/40' : 'hidden'}
          lg:block lg:relative lg:bg-transparent lg:z-0
        `}
          onClick={e => { if (e.target === e.currentTarget) setSidebarOpen(false) }}>

          <div className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed left-0 top-0 bottom-0 z-50 w-72 bg-[#f4fbf5] border-r border-gray-200 shadow-2xl lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:static lg:translate-x-0 lg:shadow-none lg:w-64 lg:bg-transparent lg:border-none
            flex flex-col overflow-y-auto lg:overflow-y-hidden transition-transform duration-300 ease-out
          `}>

            <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-[#0f4c35]" />
                <span className="text-sm font-extrabold text-gray-900">Filters</span>
              </div>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="text-xs text-[#0f4c35] font-semibold hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <div className="px-5 py-4 border-b border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.length === 0 && selectedSubcategories.length === 0}
                  onChange={clearFilters}
                  className="w-4 h-4 rounded border-gray-300 accent-[#0f4c35] cursor-pointer"
                />
                <span className={`text-sm font-semibold transition-colors ${
                  selectedCategories.length === 0 && selectedSubcategories.length === 0 ? 'text-[#0f4c35]' : 'text-gray-700 group-hover:text-[#0f4c35]'
                }`}>
                  All Products
                </span>
              </label>
            </div>

            <div className="px-5 py-4 space-y-5">
              {categories.map(cat => {
                const subs       = subsForCat(cat.id)
                const isSelected = selectedCategories.includes(cat.id)
                return (
                  <div key={cat.id}>
                    <label className="flex items-center gap-3 cursor-pointer group mb-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryChange(cat.id)}
                        className="w-4 h-4 rounded border-gray-300 accent-[#0f4c35] cursor-pointer"
                      />
                      <span className={`text-sm font-bold transition-colors ${
                        isSelected ? 'text-[#0f4c35]' : 'text-gray-800 group-hover:text-[#0f4c35]'
                      }`}>
                        {cat.name}
                      </span>
                    </label>
                    {subs.length > 0 && (
                      <div className="ml-4 space-y-2 border-l-2 border-gray-100 pl-4">
                        {subs.map(sub => {
                          const isSubSelected = selectedSubcategories.includes(sub.id)
                          return (
                            <label key={sub.id} className="flex items-center gap-2.5 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={isSubSelected}
                                onChange={() => handleSubChange(sub.id, cat.id)}
                                className="w-3.5 h-3.5 rounded border-gray-300 accent-[#0f4c35] cursor-pointer"
                              />
                              <span className={`text-xs transition-colors ${
                                isSubSelected
                                  ? 'text-[#0f4c35] font-bold'
                                  : 'text-gray-500 group-hover:text-gray-800 font-medium'
                              }`}>
                                {sub.name}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {hasFilters && (
              <div className="px-5 py-4 border-t border-gray-100 bg-[#e8f5ee]">
                <p className="text-xs font-bold text-[#0f4c35] mb-2">Active filters</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCatObj.map(cat => (
                    <span key={cat.id} className="inline-flex items-center gap-1 text-xs bg-white text-[#0f4c35] px-2 py-0.5 rounded-full border border-[#0f4c35]/20 font-medium">
                      {cat.name}
                      <button onClick={() => handleCategoryChange(cat.id)}>
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                  {selectedSubObj.map(sub => (
                    <span key={sub.id} className="inline-flex items-center gap-1 text-xs bg-white text-[#0f4c35] px-2 py-0.5 rounded-full border border-[#0f4c35]/20 font-medium">
                      {sub.name}
                      <button onClick={() => handleSubChange(sub.id, sub.categoryId)}><X size={9} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ══ MAIN CONTENT ═══════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-4 pt-6 pb-10 sm:px-6 lg:px-8">

            {/* Top bar — search + mobile filter + count */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-950">Store</h1>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e8f5ee] text-[#0f4c35]">Shop Easily</span>
                </div>
                <p className="text-sm text-slate-500 max-w-2xl">Discover fresh arrivals, curated collections, and everyday essentials — all in one clean shopping experience.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button onClick={() => setSidebarOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-gray-50 transition">
                  <SlidersHorizontal size={14} /> Filters
                </button>

                <div className="relative w-full max-w-xl">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" placeholder="Search products..."
                    value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent"
                  />
                  {search && (
                    <button onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── PRODUCT GRID ───────────────────────────────────── */}
            {loading ? (
              <div className={gridClasses}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl animate-pulse border border-gray-100 overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                      <div className="h-4 bg-gray-100 rounded-full w-full" />
                      <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
                <Package size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No products found</p>
                <button onClick={clearFilters}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-[#0f4c35] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#14492e]">
                  Reset search
                </button>
              </div>
            ) : (
              <>
                <div className={gridClasses}>
                  {pagedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                      className="px-4 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                      ← Previous
                    </button>
                    <span className="text-xs text-gray-400 px-2">{page + 1} / {totalPages}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                      className="px-4 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.slug}`}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-[#0f4c35]/30 hover:shadow-lg transition duration-300 ease-out group flex flex-col">
      <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
        {product.imageURL
          ? <img src={product.imageURL} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center">
              <Package size={20} className="text-gray-300" />
            </div>
        }
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-400">Out of stock</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#eaf8ef] text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0f4c35]">
            {product.subcategories?.[0] || product.categories?.[0] || 'General'}
          </span>
        </div>
        <h2 className="text-sm font-semibold text-slate-950 line-clamp-2 leading-snug">
          {product.name}
        </h2>
        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-base font-extrabold text-slate-950">
            KSh {Number(product.price).toLocaleString()}
          </p>
          <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${product.stockQuantity > 0 ? 'bg-[#e8f5ee] text-[#0f4c35]' : 'bg-slate-100 text-slate-500'}`}>
            {product.stockQuantity > 0 ? 'In stock' : 'Sold out'}
          </span>
        </div>
      </div>
    </Link>
  )
}