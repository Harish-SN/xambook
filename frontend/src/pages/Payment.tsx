import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/Payment.css'

export default function Payment() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handlePayment() {
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8080/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const order = await res.json()

      const options = {
        key: 'rzp_test_xxxx',
        amount: order.amount,
        currency: order.currency,
        name: 'XamBook',
        description: 'Premium Access — Lifetime',
        order_id: order.id,
        handler: async function (response: any) {
          const verify = await fetch('http://localhost:8080/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          if (verify.ok) {
            alert('🎉 Payment successful! Premium activated.')
            navigate('/dashboard')
          } else {
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: { name: '', email: '' },
        theme: { color: '#4f46e5' },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="payPage">
      <Navbar />
      <main className="payMain">
        <div className="payCard">
          <div className="payHeader">
            <div className="payBadge">⚡ ONE-TIME PAYMENT</div>
            <h1 className="payTitle">Go Premium</h1>
            <p className="paySub">Full access to all 20 NEET tests. Pay once, use forever.</p>
          </div>
          <div className="payPriceBox">
            <div className="payPriceRow">
              <span className="payPrice">₹99</span>
              <span className="payPriceNote">one-time · no renewals</span>
            </div>
          </div>
          <div className="payPerks">
            {[
              { icon: '📋', text: '20 subject-wise & full mock tests' },
              { icon: '🧬', text: 'Botany, Zoology, Physics & Chemistry' },
              { icon: '📊', text: 'Instant score & analysis after each test' },
              { icon: '🔁', text: 'Retry any test unlimited times' },
              { icon: '📱', text: 'Works on mobile & desktop' },
              { icon: '♾️', text: 'Lifetime access, no expiry' },
            ].map((p) => (
              <div key={p.text} className="payPerk">
                <span className="payPerkIcon">{p.icon}</span>
                <span className="payPerkText">{p.text}</span>
              </div>
            ))}
          </div>
          <button className="payBtn" onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : 'Pay ₹99 & Unlock Access'}
          </button>
          <p className="payNote">
            Secure payment via Razorpay · UPI, Cards, Netbanking accepted
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}