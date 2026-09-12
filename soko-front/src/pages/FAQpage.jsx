/*
 * FAQPage.jsx — Frequently Asked Questions
 * Static page with expandable FAQ items.
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FAQS = [
  { q: 'How do I place an order?',          a: 'Browse the store, add items to your cart, then proceed to checkout. Fill in your delivery details and confirm your order.' },
  { q: 'What areas do you deliver to?',     a: 'We currently deliver across Nairobi. We are working on expanding to other counties soon.' },
  { q: 'How much does delivery cost?',      a: 'Delivery is free on orders over KSh 2,000. For smaller orders, a flat fee of KSh 200 applies.' },
  { q: 'How do I pay?',                     a: 'We accept M-Pesa and major credit/debit cards. Payment is collected on delivery.' },
  { q: 'Can I cancel or change my order?',  a: 'You can cancel or modify your order within 1 hour of placing it by contacting our support team.' },
  { q: 'How do I track my order?',          a: 'Once your order is confirmed, you can track its status from the My Orders page in your account.' },
  { q: 'Are products fresh and quality guaranteed?', a: 'Yes. We source directly from verified local suppliers and farmers. If you receive a substandard product, contact us for a replacement or refund.' },
]

export default function FAQPage() {
  const [open, setOpen] = useState(null)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">

        {/* Header */}
        <section className="bg-[#f9fafb] border-b border-gray-100 py-12">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Frequently Asked Questions</h1>
            <p className="text-sm text-gray-500">Everything you need to know about shopping with SokoOnline.</p>
          </div>
        </section>

        {/* FAQ list */}
        <section className="py-12">
          <div className="max-w-2xl mx-auto px-6">
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* Question — clickable toggle */}
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                    {open === i
                      ? <ChevronUp size={15} className="text-[#0f4c35] shrink-0" />
                      : <ChevronDown size={15} className="text-gray-400 shrink-0" />}
                  </button>
                  {/* Answer — shown when expanded */}
                  {open === i && (
                    <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 bg-gray-50">
                      <p className="pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}