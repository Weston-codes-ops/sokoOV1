/*
 * FAQPage.jsx — Frequently Asked Questions
 * Static page with expandable FAQ items.
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FAQS = [
  { q: 'What is SokoOnline?',               a: 'SokoOnline is my online shop, with a growing collection of products chosen to share with you.' },
  { q: 'How do I place an order?',          a: 'Browse the store, add items to your cart, then follow the steps shown to submit your order.' },
  { q: 'What areas do you deliver to?',     a: 'Delivery availability depends on your location. I’ll confirm the available options when you place your order.' },
  { q: 'How much does delivery cost?',      a: 'Any delivery charges will be shared with you before your order is finalized.' },
  { q: 'How do I pay?',                     a: 'I’ll let you know which payment options are available when you place your order.' },
  { q: 'Can I cancel or change my order?',  a: 'Please contact me as soon as possible. Changes may not be possible once your order is being prepared.' },
  { q: 'How do I track my order?',          a: 'If order tracking is available for your purchase, I’ll share the relevant updates with you.' },
  { q: 'How can I learn more about a product?', a: 'Check the product listing for its details. If you still have a question, please get in touch before ordering.' },
]

export default function FAQPage() {
  const [open, setOpen] = useState(null)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">

        {/* Header */}
        <section className="bg-surface-subtle border-b border-gray-100 py-12">
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
                      ? <ChevronUp size={15} className="text-brand-primary shrink-0" />
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