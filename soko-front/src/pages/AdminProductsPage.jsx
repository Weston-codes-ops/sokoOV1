import { useEffect, useState } from 'react'
import { Check, ImagePlus, Plus, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import api from '../api/axios'

const initialForm = {
  name: '',
  description: '',
  stockQuantity: '',
  price: '',
  imageURL: '',
  categories: [],
  subcategories: [],
}

const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxImageSize = 10 * 1024 * 1024

function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-[#e1e9e3] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
    </div>
  )
}

export default function AdminProductsPage() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [categoryName, setCategoryName] = useState('')
  const [subcategoryName, setSubcategoryName] = useState('')
  const [parentCategoryId, setParentCategoryId] = useState('')
  const [notice, setNotice] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [productStatus, setProductStatus] = useState('')
  const [stockFilter, setStockFilter] = useState('')

  const loadProducts = async () => {
    setProductsLoading(true)
    try {
      const { data } = await api.get('/products?page=0&size=100')
      setProducts(data.content ?? data ?? [])
    } catch {
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories')
      setCategories(data ?? [])
    } catch {
      setCategories([])
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadProducts, 0)
    const categoryTimer = window.setTimeout(loadCategories, 0)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(categoryTimer)
    }
  }, [])

  const topCategories = categories.filter((category) => !category.parentId)
  const childCategories = categories.filter((category) => category.parentId)
  const hasProductFilters = productSearch || productCategory || productStatus || stockFilter
  const filteredProducts = products.filter((product) => {
    const searchTerm = productSearch.trim().toLowerCase()
    const searchableText = [product.name, product.description, ...(product.categories ?? []), ...(product.subcategories ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    const matchesSearch = !searchTerm || searchableText.includes(searchTerm)
    const matchesCategory = !productCategory || product.categories?.includes(productCategory) || product.subcategories?.includes(productCategory)
    const matchesStatus = !productStatus || (productStatus === 'live' ? product.isActive : !product.isActive)
    const quantity = Number(product.stockQuantity)
    const matchesStock = !stockFilter
      || (stockFilter === 'in-stock' && quantity > 0)
      || (stockFilter === 'low' && quantity > 0 && quantity <= 5)
      || (stockFilter === 'out' && quantity === 0)
    return matchesSearch && matchesCategory && matchesStatus && matchesStock
  })
  const resetProductFilters = () => {
    setProductSearch('')
    setProductCategory('')
    setProductStatus('')
    setStockFilter('')
  }

  const createCategory = async (event, parentId = null) => {
    event.preventDefault()
    const name = parentId ? subcategoryName.trim() : categoryName.trim()
    if (!name) return
    try {
      await api.post('/categories', { name, parentId })
      setCategoryName('')
      setSubcategoryName('')
      setParentCategoryId('')
      setNotice({ type: 'success', message: parentId ? 'Subcategory created.' : 'Category created.' })
      await loadCategories()
    } catch (error) {
      setNotice({ type: 'error', message: error.response?.data?.message || 'The category could not be created.' })
    }
  }

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setNotice(null)
  }

  const uploadProductImage = async () => {
    if (!imageFile) return form.imageURL

    setImageUploading(true)
    const { data: signature } = await api.get('/admin/media/cloudinary/signature')
    const uploadData = new FormData()
    uploadData.append('file', imageFile)
    uploadData.append('api_key', signature.apiKey)
    uploadData.append('timestamp', signature.timestamp)
    uploadData.append('folder', signature.folder)
    uploadData.append('transformation', signature.transformation)
    uploadData.append('signature', signature.signature)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
      method: 'POST',
      body: uploadData,
    })
    if (!response.ok) {
      throw new Error('The image upload failed. Check the file and Cloudinary configuration.')
    }
    const uploadedImage = await response.json()
    setImageUploading(false)
    return uploadedImage.secure_url
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setImageFile(null)
      return
    }
    if (!supportedImageTypes.includes(file.type)) {
      setImageFile(null)
      setNotice({ type: 'error', message: 'Choose a JPG, PNG, or WebP image.' })
      event.target.value = ''
      return
    }
    if (file.size > maxImageSize) {
      setImageFile(null)
      setNotice({ type: 'error', message: 'Images must be 10 MB or smaller.' })
      event.target.value = ''
      return
    }
    setImageFile(file)
    setNotice(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice(null)

    try {
      const imageURL = await uploadProductImage()
      await api.post('/products', {
        ...form,
        imageURL,
        stockQuantity: Number(form.stockQuantity),
        price: Number(form.price),
      })
      setForm(initialForm)
      setImageFile(null)
      setIsCreateModalOpen(false)
      setNotice({ type: 'success', message: 'Product added. It is now visible on the storefront.' })
      await loadProducts()
    } catch (error) {
      const message = error.response?.status === 401 || error.response?.status === 403
        ? 'Admin authorization expired. Sign out, then sign in again through the admin entrance before uploading an image.'
        : error.message || error.response?.data?.message || 'The product could not be shelved. Check the details and try again.'
      setNotice({
        type: 'error',
        message,
      })
    } finally {
      setImageUploading(false)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-col gap-5  bg-transparent p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Catalog control</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">Manage your product catalogue. Keep track of your inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0f4c35] px-4 py-3 text-sm font-bold text-[#0f4c35] shadow-sm transition hover:bg-[#e8f5ee]">
            <Plus size={17} /> Manage categories
          </button>
          <button type="button" onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f4c35] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b3928]">
            <Plus size={17} /> Create product
          </button>
        </div>
      </header>

      {notice && (
        <div className={`mb-6 flex items-center gap-2 border px-4 py-3 text-sm font-semibold ${notice.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {notice.type === 'success' && <Check size={17} />}
          {notice.message}
        </div>
      )}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total products" value={products.length} detail="Published records" />
        <MetricCard label="Live products" value={products.filter((product) => product.isActive).length} detail="Visible in the store" />
        <MetricCard label="Low stock" value={products.filter((product) => Number(product.stockQuantity) > 0 && Number(product.stockQuantity) <= 5).length} detail="Five units or fewer" />
        <MetricCard label="Inventory value" value={`KES ${products.reduce((total, product) => total + (Number(product.price) * Number(product.stockQuantity)), 0).toLocaleString()}`} detail="Price x stock" />
      </section>

      {isCreateModalOpen && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 sm:py-10" role="dialog" aria-modal="true" aria-labelledby="create-product-title">
        <div className="my-auto w-full max-w-4xl rounded-2xl bg-[#f8fbf7] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f4c35]">Catalog entry</p>
              <h2 id="create-product-title" className="mt-1 text-2xl font-black tracking-tight text-slate-950">Create product</h2>
            </div>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} aria-label="Close create product dialog" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
          </div>
          <form onSubmit={submit} className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_300px]">
            <section className="rounded-2xl border border-[#e1e9e3] bg-white p-6 shadow-sm sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-bold text-slate-800 sm:col-span-2">
                  Product name
                  <input required value={form.name} onChange={(event) => update('name', event.target.value)} className="admin-input" placeholder="e.g. Woven market basket" />
                </label>
                <label className="block text-sm font-bold text-slate-800 sm:col-span-2">
                  Description
                  <textarea required rows={5} value={form.description} onChange={(event) => update('description', event.target.value)} className="admin-input resize-y" placeholder="What should shoppers know?" />
                </label>
                <label className="block text-sm font-bold text-slate-800">
                  Price
                  <div className="relative mt-2"><span className="absolute left-4 top-3 text-sm text-slate-400">KES</span><input required min="0.01" step="0.01" type="number" value={form.price} onChange={(event) => update('price', event.target.value)} className="admin-input mt-0 pl-14" placeholder="0.00" /></div>
                </label>
                <label className="block text-sm font-bold text-slate-800">
                  Stock quantity
                  <input required min="0" type="number" value={form.stockQuantity} onChange={(event) => update('stockQuantity', event.target.value)} className="admin-input" placeholder="0" />
                </label>
                <label className="block text-sm font-bold text-slate-800 sm:col-span-2">
                  Product image
                  <div className="relative mt-2"><ImagePlus className="absolute left-4 top-3 text-slate-400" size={17} /><input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="admin-input mt-0 pl-11 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-[#0f4c35]" /></div>
                  <span className="mt-2 block text-xs font-medium text-slate-400">JPG, PNG or WebP, up to 10 MB. Images are cropped to a uniform 1200 x 1200 resolution.</span>
                  <input type="url" value={form.imageURL} onChange={(event) => update('imageURL', event.target.value)} className="admin-input" placeholder="Or paste an existing image URL" />
                </label>
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-2xl border border-[#e1e9e3] bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-900">Product taxonomy</h2>
                <div className="space-y-5">
                  <label className="block text-sm font-bold text-slate-800">Category
                    <select value={form.categories[0] ?? ''} onChange={(event) => update('categories', event.target.value ? [event.target.value] : [])} className="admin-input">
                      <option value="">No category</option>
                      {topCategories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-bold text-slate-800">Subcategory <span className="font-normal text-slate-400">(optional)</span>
                    <select value={form.subcategories[0] ?? ''} onChange={(event) => update('subcategories', event.target.value ? [event.target.value] : [])} className="admin-input">
                      <option value="">No subcategory</option>
                      {childCategories.filter((category) => !form.categories[0] || category.parentId === topCategories.find((parent) => parent.name === form.categories[0])?.id).map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                    </select>
                  </label>
                </div>
              </section>
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#d97706] disabled:cursor-wait disabled:opacity-60">
                <Plus size={17} /> {imageUploading ? 'Uploading image...' : loading ? 'Shelving product...' : 'Publish product'}
              </button>
              <p className="px-2 text-center text-xs leading-relaxed text-slate-400">Only authenticated admins can publish. The public store reads active products automatically.</p>
            </aside>
          </form>
        </div>
      </div>}

      {isCategoryModalOpen && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-6 sm:py-10" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
        <div className="my-auto w-full max-w-2xl rounded-2xl bg-[#f8fbf7] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f4c35]">Manage taxonomy</p>
              <h2 id="category-modal-title" className="mt-1 text-2xl font-black tracking-tight text-slate-950">Create categories</h2>
            </div>
            <button type="button" onClick={() => setIsCategoryModalOpen(false)} aria-label="Close category dialog" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
          </div>
          <div className="grid gap-6 p-6 sm:p-8">
            <form onSubmit={createCategory} className="rounded-2xl border border-[#e1e9e3] bg-white p-5 shadow-sm">
              <label className="block text-sm font-bold text-slate-800">New category
                <input required value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="admin-input" placeholder="e.g. Home essentials" />
              </label>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0f4c35] px-4 py-3 text-sm font-bold text-white"><Plus size={17} /> Add category</button>
            </form>
            <form onSubmit={(event) => createCategory(event, parentCategoryId || null)} className="rounded-2xl border border-[#e1e9e3] bg-white p-5 shadow-sm">
              <label className="block text-sm font-bold text-slate-800">Parent category
                <select required value={parentCategoryId} onChange={(event) => setParentCategoryId(event.target.value)} className="admin-input">
                  <option value="">Select a parent category</option>
                  {topCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label className="mt-4 block text-sm font-bold text-slate-800">New subcategory
                <input required value={subcategoryName} onChange={(event) => setSubcategoryName(event.target.value)} className="admin-input" placeholder="e.g. Baskets" />
              </label>
              <button disabled={!parentCategoryId} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Plus size={17} /> Add subcategory</button>
            </form>
          </div>
        </div>
      </div>}

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f4c35]">Published catalog</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Products on the shelf</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
            {filteredProducts.length} of {products.length} products
          </span>
        </div>

        <div className="mb-5 rounded-2xl border border-[#e1e9e3] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <SlidersHorizontal size={17} className="text-[#0f4c35]" />
              Find and filter products
            </div>
            {hasProductFilters && (
              <button type="button" onClick={resetProductFilters} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0f4c35]">
                <RotateCcw size={14} /> Reset filters
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1.6fr)_minmax(160px,1fr)_minmax(140px,0.8fr)_minmax(140px,0.8fr)]">
            <label className="relative block">
              <span className="sr-only">Search products</span>
              <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} className="admin-input mt-0 pl-10" placeholder="Search name, description or category" />
            </label>
            <label>
              <span className="sr-only">Filter by category</span>
              <select value={productCategory} onChange={(event) => setProductCategory(event.target.value)} className="admin-input mt-0">
                <option value="">All categories</option>
                {categories.map((category) => <option key={category.id} value={category.name}>{category.parentId ? `${category.name} (subcategory)` : category.name}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Filter by status</span>
              <select value={productStatus} onChange={(event) => setProductStatus(event.target.value)} className="admin-input mt-0">
                <option value="">All statuses</option>
                <option value="live">Live</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Filter by stock</span>
              <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} className="admin-input mt-0">
                <option value="">All stock levels</option>
                <option value="in-stock">In stock</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
              </select>
            </label>
          </div>
        </div>

        {productsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-sm font-bold text-slate-700">The catalog is waiting for its first arrival.</p>
            <p className="mt-1 text-xs text-slate-400">Publish a product above and it will appear here.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-sm font-bold text-slate-700">No products match these filters.</p>
            <button type="button" onClick={resetProductFilters} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#0f4c35] hover:underline">
              <RotateCcw size={15} /> Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-[#e1e9e3]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-[#f7faf7] text-xs uppercase tracking-wider text-slate-500">
                <tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Stock</th><th className="px-5 py-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => <tr key={product.id} className="hover:bg-[#fbfdfb]"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#eaf2ec]">{product.imageURL ? <img src={product.imageURL} alt="" className="h-full w-full object-cover" /> : null}</div><div><p className="font-bold text-slate-900">{product.name}</p><p className="max-w-sm truncate text-xs text-slate-500">{product.description}</p></div></div></td><td className="px-5 py-4 text-slate-600">{product.categories?.join(', ') || 'Uncategorized'}{product.subcategories?.length ? <span className="block text-xs text-slate-400">{product.subcategories.join(', ')}</span> : null}</td><td className="px-5 py-4 font-bold text-[#0f4c35]">KES {Number(product.price).toLocaleString()}</td><td className="px-5 py-4 text-slate-600">{product.stockQuantity}</td><td className="px-5 py-4"><span className={product.isActive ? 'font-bold text-[#0f4c35]' : 'font-bold text-slate-400'}>{product.isActive ? 'Live' : 'Hidden'}</span></td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
