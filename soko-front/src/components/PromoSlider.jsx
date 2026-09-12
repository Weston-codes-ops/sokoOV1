/*
 * PromoSection.jsx — Animated Promo Hero Section
 *
 * Left side: Decorative confetti/burst animation with a bold
 *            promotional headline and CTA button.
 *
 * Right side: Vertical auto-scrolling list of promo products
 *             that slides upward continuously.
 *
 * The two sides sit side by side on desktop, stacked on mobile.
 */

import { Link } from 'react-router-dom'
import { ShoppingBag, Zap } from 'lucide-react'

// ── Confetti pieces — purely decorative CSS shapes ────────────
const CONFETTI = [
  { color: '#f59e0b', size: 10, top: '10%',  left: '8%',  delay: '0s',    shape: 'circle' },
  { color: '#0f4c35', size: 7,  top: '25%',  left: '18%', delay: '0.3s',  shape: 'square' },
  { color: '#fcd34d', size: 12, top: '60%',  left: '5%',  delay: '0.6s',  shape: 'circle' },
  { color: '#6ee7b7', size: 8,  top: '75%',  left: '22%', delay: '0.9s',  shape: 'square' },
  { color: '#f59e0b', size: 6,  top: '40%',  left: '28%', delay: '1.2s',  shape: 'circle' },
  { color: '#fff',    size: 9,  top: '85%',  left: '12%', delay: '0.4s',  shape: 'square' },
  { color: '#fcd34d', size: 5,  top: '15%',  left: '35%', delay: '0.7s',  shape: 'circle' },
  { color: '#6ee7b7', size: 11, top: '50%',  left: '40%', delay: '1s',    shape: 'square' },
]

export default function PromoSection({ items = [] }) {
  if (items.length === 0) return null

  // Duplicate for seamless vertical loop
  const doubled = [...items, ...items]

  return (
    <section className="bg-[#0f4c35] rounded-2xl overflow-hidden mx-6 my-8 lg:mx-0 lg:my-0 lg:rounded-none">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row items-center gap-8">

          {/* ── LEFT — Confetti + Headline ──────────────────────── */}
          <div className="flex-1 relative min-h-[260px] flex items-center justify-center lg:justify-start">

            {/* Confetti dots — absolutely positioned decorations */}
            {CONFETTI.map((c, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  top: c.top,
                  left: c.left,
                  width: c.size,
                  height: c.size,
                  backgroundColor: c.color,
                  borderRadius: c.shape === 'circle' ? '50%' : '2px',
                  animationDelay: c.delay,
                  animationDuration: `${1.5 + i * 0.2}s`,
                  opacity: 0.85,
                }}
              />
            ))}

            {/* Large decorative ring */}
            <div className="absolute w-48 h-48 rounded-full border-2 border-white/10 top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute w-32 h-32 rounded-full border border-[#f59e0b]/20 top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2" />

            {/* Content */}
            <div className="relative z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#f59e0b]/20 border border-[#f59e0b]/30 rounded-full px-3 py-1 mb-4">
                <Zap size={11} className="text-[#f59e0b]" fill="#f59e0b" />
                <span className="text-[#f59e0b] text-xs font-bold uppercase tracking-widest">
                  Flash Deals
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
                Today's<br />
                <span className="text-[#f59e0b]">Hot Offers</span>
              </h2>

              <p className="text-white/60 text-sm mb-6 max-w-xs">
                Limited time deals on fresh produce, fashion and more.
              </p>

              <Link to="/store"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-amber-900/30">
                Shop all deals
                <ShoppingBag size={14} />
              </Link>
            </div>
          </div>

          {/* ── RIGHT — Vertical auto-scroll product list ────────── */}
          <div className="w-full lg:w-72 overflow-hidden relative" style={{ height: 300 }}>

            {/* Top fade */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#0f4c35] to-transparent z-10 pointer-events-none" />
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0f4c35] to-transparent z-10 pointer-events-none" />

            {/*
             * Vertical scroll strip.
             * translateY(-50%) shifts up by half = one full set of items.
             * Duration scales with item count for consistent speed.
             */}
            <div
              className="flex flex-col gap-2"
              style={{
                animation: `scrollUp ${items.length * 2.5}s linear infinite`,
              }}
              onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
              onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
            >
              {doubled.map((item, i) => (
                <PromoCard key={`${item.id}-${i}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </section>
  )
}

function PromoCard({ item }) {
  return (
    <Link
      to={`/products/${item.slug}`}
      className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2.5 transition-colors group shrink-0"
    >
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden shrink-0">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={14} className="text-white/40" />
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white line-clamp-1">{item.name}</p>
        <p className="text-xs text-[#f59e0b] font-bold mt-0.5">
          KSh {Number(item.price).toLocaleString()}
        </p>
      </div>

      {/* Badge */}
      {item.badge && (
        <span className="text-xs font-extrabold bg-[#f59e0b] text-white px-1.5 py-0.5 rounded-full shrink-0">
          {item.badge}
        </span>
      )}
    </Link>
  )
}