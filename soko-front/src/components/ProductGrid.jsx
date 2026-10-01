import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'

const gridClasses = 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'

export default function ProductGrid({ products = [], loading = false }) {
  if (loading) {
    return (
      <div className={gridClasses}>
        {[...Array(12)].map((_, index) => (
          <div key={index} className="animate-pulse border border-gray-100 overflow-hidden">
            <div className="aspect-4/3 bg-gray-100" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-gray-100 rounded-full w-3/4" />
              <div className="h-4 bg-gray-100 rounded-full w-full" />
              <div className="h-4 bg-gray-100 rounded-full w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={gridClasses}>
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden bg-white shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-xl">
      <div className="relative aspect-4/3 overflow-hidden bg-surface-tint">
        {product.imageURL
          ? <img src={product.imageURL} alt={product.name}
              className="w-full h-full object-contain p-3 transition-transform duration-300" />
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
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-tint text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-primary">
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
          <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${product.stockQuantity > 0 ? 'bg-surface-tint text-brand-primary' : 'bg-slate-100 text-slate-500'}`}>
            {product.stockQuantity > 0 ? 'In stock' : 'Sold out'}
          </span>
        </div>
      </div>
    </Link>
  )
}