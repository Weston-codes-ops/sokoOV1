import { useEffect, useState } from 'react'
import { Check, ImagePlus, Plus, Sparkles, X } from 'lucide-react'
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

function TagInput({ label, hint, values, onChange }) {
  const [draft, setDraft] = useState('')

  const addValue = () => {
    const value = draft.trim()
    if (!value || values.includes(value)) return
    onChange([...values, value])
    setDraft('')
  }

  const removeValue = (value) => onChange(values.filter((item) => item !== value))

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-bold text-slate-800">{label}</label>
        <span className="text-[11px] text-slate-400">{hint}</span>
      </div>
      <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2 focus-within:border-[#0f4c35] focus-within:ring-2 focus-within:ring-[#0f4c35]/10">
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className="inline-flex items-center gap-1.5 rounded-lg bg-[#e6f3ea] px-2.5 py-1.5 text-xs font-bold text-[#0f4c35]">
              {value}
              <button type="button" onClick={() => removeValue(value)} aria-label={`Remove ${value}`} className="hover:text-red-600">
                <X size={13} />
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault()
                addValue()
              }
            }}
            onBlur={addValue}
            placeholder={values.length ? 'Add another...' : 'Type and press Enter'}
            className="min-w-37.5 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [notice, setNotice] = useState(null)

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

  useEffect(() => {
    const timer = window.setTimeout(loadProducts, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setNotice(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice(null)

    try {
      await api.post('/products', {
        ...form,
        stockQuantity: Number(form.stockQuantity),
        price: Number(form.price),
      })
      setForm(initialForm)
      setNotice({ type: 'success', message: 'Product added. It is now visible on the storefront.' })
      await loadProducts()
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.response?.data?.message || 'The product could not be shelved. Check the details and try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-[#dce9df] bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0f4c35]">
            <Sparkles size={14} /> Catalog operations
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Catalog control</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">Give the storefront something worth finding, then keep an eye on everything currently published.</p>
        </div>
        <div className="rounded-2xl border border-[#d7eadb] bg-[#eff8f1] px-4 py-3 text-xs font-semibold text-[#0f4c35]">
          <span className="block text-[10px] uppercase tracking-widest text-[#6c9a78]">Publishing to</span>
          Live storefront
        </div>
      </header>

      {notice && (
        <div className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${notice.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {notice.type === 'success' && <Check size={17} />}
          {notice.message}
        </div>
      )}

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_330px]">
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
              Image URL
              <div className="relative mt-2"><ImagePlus className="absolute left-4 top-3 text-slate-400" size={17} /><input type="url" value={form.imageURL} onChange={(event) => update('imageURL', event.target.value)} className="admin-input mt-0 pl-11" placeholder="https://..." /></div>
            </label>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#e1e9e3] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-black uppercase tracking-wider text-slate-900">Product taxonomy</h2>
            <div className="space-y-5">
              <TagInput label="Categories" hint="Store labels" values={form.categories} onChange={(value) => update('categories', value)} />
              <TagInput label="Subcategories" hint="More specific labels" values={form.subcategories} onChange={(value) => update('subcategories', value)} />
            </div>
          </section>
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#d97706] disabled:cursor-wait disabled:opacity-60">
            <Plus size={17} /> {loading ? 'Shelving product...' : 'Publish product'}
          </button>
          <p className="px-2 text-center text-xs leading-relaxed text-slate-400">Only authenticated admins can publish. The public store reads active products automatically.</p>
        </aside>
      </form>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f4c35]">Published catalog</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Products on the shelf</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </span>
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
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#e1e9e3] transition hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-video bg-[#eaf2ec]">
                  {product.imageURL ? (
                    <img src={product.imageURL} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-[#6c9a78]">No image yet</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-black text-slate-900">{product.name}</h3>
                    <span className="whitespace-nowrap text-sm font-black text-[#0f4c35]">KES {Number(product.price).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
                    <span>{product.stockQuantity} in stock</span>
                    <span className="text-[#0f4c35]">{product.isActive ? 'Live' : 'Hidden'}</span>
                  </div>
                  {(product.categories?.length > 0 || product.subcategories?.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[...(product.categories ?? []), ...(product.subcategories ?? [])].map((label) => (
                        <span key={label} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{label}</span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
