/*
 * Footer.jsx — Site Footer
 *
 * Appears at the bottom of every page.
 * Contains:
 * - Brand info and social links
 * - Quick shop links
 * - Help links
 * - Contact info
 * - Copyright bar
 *
 * The dark green background (#0a3526) is slightly darker than
 * the brand green to give the footer a grounded, solid feel.
 */

import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0a3526] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6">

        {/* ── Main Footer Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-12 border-b border-white/10">

          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#f59e0b] rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-extrabold">S</span>
              </div>
              <span className="text-base font-extrabold">
                Soko<span className="text-[#f59e0b]">Online</span>
              </span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed mb-4 max-w-xs">
              Nairobi's trusted online marketplace for fresh produce, fashion and home essentials.
            </p>
            {/* Social icons */}
            <div className="flex gap-2">
              {[].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-7 h-7 bg-white/10 hover:bg-[#f59e0b] rounded-lg flex items-center justify-center transition-colors">
                  <Icon size={13} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white/80">Shop</h4>
            <ul className="space-y-2.5">
              {[
                ['All Products',   '/store'],
                ['Fresh Produce',  '/store'],
                ['Fashion',        '/store'],
                ['Home & Living',  '/store'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to}
                    className="text-white/50 hover:text-white text-xs transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white/80">Help</h4>
            <ul className="space-y-2.5">
              {[
                ['FAQs',           '/faqs'],
                ['About Us',       '/about'],
                ['My Orders',      '/orders'],
                ['Create Account', '/register'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to}
                    className="text-white/50 hover:text-white text-xs transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white/80">Contact</h4>
            <ul className="space-y-3">
              {[
                [MapPin, 'Nairobi, Kenya'],
                [Phone,  '+254 700 000 000'],
                [Mail,   'hello@sokoonline.co.ke'],
              ].map(([Icon, text]) => (
                <li key={text} className="flex items-center gap-2 text-xs text-white/50">
                  <Icon size={12} className="text-[#f59e0b] shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5 text-xs text-white/30">
          <p>© {new Date().getFullYear()} SokoOnline. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  )
}