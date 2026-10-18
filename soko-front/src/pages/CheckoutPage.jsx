import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock3, MapPin, Package, ShieldCheck, ShoppingBag } from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

const inputClass = 'mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'

export default function CheckoutPage() {
  const { customer } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retry, setRetry] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [paymentError, setPaymentError] = useState({ orderId: null, message: '' })
  const [checkoutError, setCheckoutError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const orderId = searchParams.get('orderId')
  const [form, setForm] = useState({
    fullName: customer?.name || '',
    email: customer?.email || '',
    phone: '',
    county: '',
    town: '',
    address: '',
    deliveryNotes: '',
  })

  useEffect(() => {
    let active = true
    api.get('/cart')
      .then(({ data }) => {
        if (active) setCart(data)
      })
      .catch((requestError) => {
        if (active) setLoadError(requestError.response?.data?.message || 'Your cart could not be loaded. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [retry])

  useEffect(() => {
    if (!orderId) return undefined

    let active = true
    let timeoutId
    const poll = async () => {
      try {
        const { data } = await api.get(`/checkout/${orderId}`)
        if (!active) return
        setPaymentStatus(data)
        setPaymentError({ orderId, message: '' })
        if (data.paymentStatus === 'PENDING') {
          timeoutId = window.setTimeout(poll, 5000)
        }
      } catch (requestError) {
        if (!active) return
        setPaymentError({
          orderId,
          message: requestError.response?.data?.message || 'Payment status could not be loaded. Retrying...',
        })
        timeoutId = window.setTimeout(poll, 8000)
      }
    }

    poll()
    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [orderId])

  const items = cart?.items ?? []
  const subtotal = items.reduce((sum, item) => sum + Number(item.subTotal || 0), 0)
  const itemQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
  }

  const submitCheckout = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setCheckoutError('')
    try {
      const { data } = await api.post('/checkout', {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phone,
        county: form.county,
        town: form.town,
        deliveryAddress: form.address,
        deliveryNotes: form.deliveryNotes,
      })
      setPaymentError({ orderId: data.orderId, message: '' })
      setSearchParams({ orderId: data.orderId })
    } catch (requestError) {
      setCheckoutError(requestError.response?.data?.message || 'We could not start your M-Pesa payment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const currentPaymentStatus = paymentStatus?.orderId === orderId ? paymentStatus : null
  const visiblePaymentError = paymentError.orderId === orderId ? paymentError.message : ''
  const paymentNeedsAttention = currentPaymentStatus?.paymentStatus === 'REVIEW_REQUIRED'
    || (currentPaymentStatus?.paymentStatus === 'SUCCEEDED' && currentPaymentStatus?.orderStatus !== 'CONFIRMED')
  const paymentComplete = currentPaymentStatus?.paymentStatus === 'SUCCEEDED' && !paymentNeedsAttention
  const paymentFailed = currentPaymentStatus?.paymentStatus === 'FAILED'

  return (
    <div className="min-h-screen flex flex-col bg-surface-subtle">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
          <Link to="/cart" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-brand-primary">
            <ArrowLeft size={16} /> Back to cart
          </Link>

          <header className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-accent">Almost there</p>
            <h1 className="mt-2 text-3xl font-extrabold text-gray-950">Checkout</h1>
            <p className="mt-2 text-sm text-gray-500">Add your contact and delivery details to prepare your order.</p>
          </header>

          {checkoutError && !orderId && (
            <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {checkoutError}
            </p>
          )}

          {orderId ? (
            <section className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
              {paymentComplete ? (
                <CheckCircle2 size={42} className="mx-auto text-emerald-600" />
              ) : paymentFailed || paymentNeedsAttention ? (
                <AlertCircle size={42} className="mx-auto text-amber-500" />
              ) : (
                <Clock3 size={42} className="mx-auto animate-pulse text-brand-primary" />
              )}
              <h2 className="mt-4 text-xl font-extrabold text-gray-900">
                {paymentComplete
                  ? 'Payment received'
                  : paymentFailed
                    ? 'Payment not completed'
                    : paymentNeedsAttention
                      ? 'Payment needs attention'
                      : 'Waiting for M-Pesa'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {currentPaymentStatus?.message || (visiblePaymentError || 'Check your phone and enter your M-Pesa PIN to complete the payment.')}
              </p>
              {visiblePaymentError && currentPaymentStatus && (
                <p role="status" className="mt-3 text-xs text-amber-700">{visiblePaymentError}</p>
              )}
              {currentPaymentStatus && (
                <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3 rounded-xl bg-surface-subtle p-4 text-left text-sm">
                  <dt className="text-gray-500">Order</dt>
                  <dd className="truncate text-right font-semibold text-gray-900">{currentPaymentStatus.orderId}</dd>
                  <dt className="text-gray-500">Amount</dt>
                  <dd className="text-right font-semibold text-gray-900">KSh {Number(currentPaymentStatus.amount).toLocaleString()}</dd>
                  {currentPaymentStatus.receiptNumber && (
                    <>
                      <dt className="text-gray-500">M-Pesa receipt</dt>
                      <dd className="text-right font-semibold text-gray-900">{currentPaymentStatus.receiptNumber}</dd>
                    </>
                  )}
                </dl>
              )}
              <p className="mt-4 text-xs leading-5 text-gray-400">
                {paymentComplete
                  ? 'Your order is confirmed. Your cart has been updated.'
                  : paymentFailed
                    ? 'Your cart has not been cleared. You can return to checkout and try again.'
                    : paymentNeedsAttention
                      ? 'Do not retry the payment yet. Contact the store with your order ID so the payment can be checked.'
                      : 'This page checks for payment confirmation automatically. Keep it open while you approve the prompt.'}
              </p>
              <Link to={paymentComplete ? '/store' : '/cart'} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-bold text-white hover:bg-brand-primary-hover">
                {paymentComplete ? 'Continue shopping' : 'Return to cart'} <ArrowRight size={15} />
              </Link>
            </section>
          ) : loading ? (
            <div className="grid animate-pulse gap-6 lg:grid-cols-[1fr_360px]">
              <div className="h-[480px] rounded-2xl bg-gray-100" />
              <div className="h-72 rounded-2xl bg-gray-100" />
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center">
              <p role="alert" className="text-sm font-semibold text-red-700">{loadError}</p>
              <button
                type="button"
                onClick={() => { setLoadError(''); setLoading(true); setRetry(current => current + 1) }}
                className="mt-5 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover">
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
              <ShoppingBag size={32} className="mx-auto mb-3 text-gray-300" />
              <h2 className="text-lg font-bold text-gray-900">Your cart is empty</h2>
              <p className="mt-1 text-sm text-gray-500">Add something from the shop before checking out.</p>
              <Link to="/store" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover">
                Browse the shop <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
              <form id="checkout-form" className="space-y-6" onSubmit={submitCheckout}>
                <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-tint text-brand-primary">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-gray-900">Contact and delivery</h2>
                      <p className="mt-0.5 text-xs text-gray-500">Where should your order go?</p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Full name
                      <input className={inputClass} name="fullName" autoComplete="name" value={form.fullName} onChange={updateField} placeholder="Your name" required />
                    </label>
                    <label className="text-sm font-semibold text-gray-700">
                      Phone number
                      <input className={inputClass} name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={updateField} placeholder="+254 7XX XXX XXX" required />
                    </label>
                    <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                      Email address
                      <input className={inputClass} name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} placeholder="you@example.com" required />
                    </label>
                    <label className="text-sm font-semibold text-gray-700">
                      County
                      <input className={inputClass} name="county" autoComplete="address-level1" value={form.county} onChange={updateField} placeholder="County" required />
                    </label>
                    <label className="text-sm font-semibold text-gray-700">
                      Town or area
                      <input className={inputClass} name="town" autoComplete="address-level2" value={form.town} onChange={updateField} placeholder="Town or neighbourhood" required />
                    </label>
                    <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                      Delivery address
                      <input className={inputClass} name="address" autoComplete="street-address" value={form.address} onChange={updateField} placeholder="Street, building, house or apartment" required />
                    </label>
                    <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                      Delivery notes <span className="font-normal text-gray-400">(optional)</span>
                      <textarea className={`${inputClass} resize-y`} name="deliveryNotes" rows={3} value={form.deliveryNotes} onChange={updateField} placeholder="Landmark or instructions for finding you" />
                    </label>
                  </div>
                </section>

                <section className="flex items-start gap-3 rounded-2xl border border-brand-primary/10 bg-brand-primary/5 p-5">
                  <ShieldCheck size={19} className="mt-0.5 shrink-0 text-brand-primary" />
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">M-Pesa payment (Sandbox)</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      Submitting creates your order and sends an M-Pesa prompt to the phone number above. This is a Daraja Sandbox test; use the test credentials and phone provided in your Safaricom developer account.
                    </p>
                  </div>
                </section>
              </form>

              <aside className="rounded-2xl border border-gray-100 bg-white p-5 lg:sticky lg:top-20">
                <h2 className="text-base font-extrabold text-gray-900">Your order</h2>
                <p className="mt-1 text-xs text-gray-500">{itemQuantity} {itemQuantity === 1 ? 'item' : 'items'}</p>

                <div className="mt-5 max-h-72 space-y-4 overflow-y-auto border-b border-gray-100 pb-5">
                  {items.map(item => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle">
                        {item.imageURL
                          ? <img src={item.imageURL} alt={item.productName} className="h-full w-full object-contain p-1" />
                          : <Package size={18} className="text-gray-300" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{item.productName}</p>
                        <p className="mt-0.5 text-xs text-gray-500">Qty {item.quantity} · KSh {Number(item.unitPrice).toLocaleString()} each</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-gray-900">KSh {Number(item.subTotal || 0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-gray-500">Items subtotal</span>
                  <span className="font-bold text-gray-900">KSh {Number(subtotal).toLocaleString()}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-medium text-emerald-700">Free for Sandbox testing</span>
                </div>
                <p className="mt-5 border-t border-gray-100 pt-4 text-xs leading-5 text-gray-400">
                  Your order is saved as pending until Daraja confirms the payment. Prices and stock are checked again on the server.
                </p>
                <button type="submit" form="checkout-form" disabled={submitting} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover disabled:cursor-wait disabled:opacity-60">
                  {submitting ? 'Starting M-Pesa prompt…' : 'Pay with M-Pesa'} <ArrowRight size={15} />
                </button>
                <Link to="/cart" className="mt-4 block text-center text-xs font-semibold text-brand-primary hover:underline">
                  Edit cart
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
