import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Package, X, SlidersHorizontal } from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import ProductGrid from '../components/ProductGrid'

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
    const loadingTimer = window.setTimeout(() => setLoading(true), 0)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    params.append('page', 0)
    params.append('size', 500)
    api.get(`/products?${params}`)
      .then(res => {
        const list = res.data.content ?? res.data ?? []
        setProducts(list)

        const derivedCategories = Array.from(new Set(list.flatMap(product => product.categories ?? []))).map(name => ({ id: name, name }))
        const derivedSubcategories = Array.from(new Set(list.flatMap(product => product.subcategories ?? []))).map(name => ({ id: name, name }))
        setCategories(current => current.length ? current : derivedCategories)
        setSubcategories(current => current.length ? current : derivedSubcategories)
      })
      .catch(() => {
        setProducts([])
      })
      .finally(() => setLoading(false))
    return () => window.clearTimeout(loadingTimer)
  }, [search])

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => {
        setCategories((data ?? []).filter(category => !category.parentId))
        setSubcategories((data ?? []).filter(category => category.parentId))
      })
      .catch(() => {})
  }, [])

  const subsForCat     = (catId) => subcategories.filter(s => (s.parentId ?? s.categoryId) === catId)
  const selectedCatObj = categories.filter(c => selectedCategories.includes(c.id))
  const selectedSubObj = subcategories.filter(s => selectedSubcategories.includes(s.id))
  const hasFilters     = search || selectedCategories.length > 0 || selectedSubcategories.length > 0

  const displayProducts = products
    .filter(p => selectedCategories.length === 0 || selectedCategories.some(id => p.categories?.includes(categories.find(category => category.id === id)?.name)))
    .filter(p => selectedSubcategories.length === 0 || selectedSubcategories.some(id => p.subcategories?.includes(subcategories.find(category => category.id === id)?.name)))
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
          return (sub?.parentId ?? sub?.categoryId) !== catId
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

  return (
    <div className="min-h-screen flex flex-col bg-surface-soft">
      <Navbar />

      <div className="flex flex-1 overflow-hidden min-h-0">

        <aside className={`
          ${sidebarOpen ? 'fixed inset-0 z-40 bg-black/40' : 'hidden'}
          lg:block lg:relative lg:bg-transparent lg:z-0
        `}
          onClick={e => { if (e.target === e.currentTarget) setSidebarOpen(false) }}>

          <div className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed left-0 top-0 bottom-0 z-50 w-72 bg-surface-soft border-r border-gray-200 shadow-2xl lg:top-0 lg:h-screen lg:max-h-screen lg:static lg:translate-x-0 lg:shadow-none lg:w-64 lg:bg-transparent lg:border-none
            flex flex-col overflow-y-auto lg:overflow-y-hidden transition-transform duration-300 ease-out
          `}>

            <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-brand-primary" />
                <span className="text-sm font-extrabold text-gray-900">Filters</span>
              </div>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="text-xs text-brand-primary font-semibold hover:underline">
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
                  className="w-4 h-4 rounded border-gray-300 accent-brand-primary cursor-pointer"
                />
                <span className={`text-sm font-semibold transition-colors ${
                  selectedCategories.length === 0 && selectedSubcategories.length === 0 ? 'text-brand-primary' : 'text-gray-700 group-hover:text-brand-primary'
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
                        className="w-4 h-4 rounded border-gray-300 accent-brand-primary cursor-pointer"
                      />
                      <span className={`text-sm font-bold transition-colors ${
                        isSelected ? 'text-brand-primary' : 'text-gray-800 group-hover:text-brand-primary'
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
                                className="w-3.5 h-3.5 rounded border-gray-300 accent-brand-primary cursor-pointer"
                              />
                              <span className={`text-xs transition-colors ${
                                isSubSelected
                                  ? 'text-brand-primary font-bold'
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
              <div className="px-5 py-4 border-t border-gray-100 bg-surface-tint">
                <p className="text-xs font-bold text-brand-primary mb-2">Active filters</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCatObj.map(cat => (
                    <span key={cat.id} className="inline-flex items-center gap-1 text-xs bg-white text-brand-primary px-2 py-0.5 rounded-full border border-brand-primary/20 font-medium">
                      {cat.name}
                      <button onClick={() => handleCategoryChange(cat.id)}>
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                  {selectedSubObj.map(sub => (
                    <span key={sub.id} className="inline-flex items-center gap-1 text-xs bg-white text-brand-primary px-2 py-0.5 rounded-full border border-brand-primary/20 font-medium">
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
          <div className="mx-auto w-full max-w-[1800px] px-4 pt-8 pb-12 sm:px-6 lg:px-10">

            {/* Top bar — search + mobile filter + count */}
            <div className="mb-8 flex flex-col gap-5 border border-brand p-5 bg-white/80 shadow-sm sm:p-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-md font-black tracking-tight text-slate-950">Store</h1>
                </div>
                <p className="text-sm text-slate-500 max-w-2xl">Explore our latest products, made for you</p>
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
                    className="w-full border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
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
              <ProductGrid loading />
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-gray-200 rounded-3xl">
                <Package size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No products found</p>
                <button onClick={clearFilters}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-primary-hover">
                  Reset search
                </button>
              </div>
            ) : (
              <>
                <ProductGrid products={pagedProducts} />

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