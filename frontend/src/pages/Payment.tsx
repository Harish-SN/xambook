import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/Payment.css'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function Payment() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  async function handlePayment() {
    setLoading(true)

    try {
      const res = await fetch(
        'https://api.xambook.com/api/payment/create-order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const order = await res.json()

      const options = {
        key: 'rzp_test_xxxx',

        amount: order.amount,
        currency: order.currency,

        name: 'XamBook',

        description: 'Premium Access — ₹99 Lifetime Plan',

        order_id: order.id,

        handler: async function (response: any) {
          try {
            const verify = await fetch(
              'https://api.xambook.com/api/payment/verify',
              {
                method: 'POST',

                headers: {
                  'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            )

            if (verify.ok) {
              alert(
                '🎉 Payment successful! Premium activated.'
              )

              navigate('/dashboard')
            } else {
              alert(
                'Payment verification failed. Please contact support.'
              )
            }
          } catch (err) {
            console.error(err)

            alert(
              'Payment verification failed. Please contact support.'
            )
          }
        },

        prefill: {
          name: '',
          email: '',
        },

        notes: {
          product: 'XamBook Premium',
          price: '99 INR',
        },

        theme: {
          color: '#4f46e5',
        },

        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)

      rzp.open()
    } catch (err) {
      console.error(err)

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

            <div className="payBadge">
              ⚡ ONE-TIME PAYMENT
            </div>

            <h1 className="payTitle">
              Go Premium
            </h1>

            <p className="paySub">
              Full access to all NEET tests.
              One payment. Lifetime access.
            </p>

          </div>

          <div className="payPriceBox">

            <div className="payPriceRow">

              <span className="payPrice">
                ₹99
              </span>

              <span className="payPriceNote">
                one-time payment
              </span>

            </div>

            <p className="payLifetime">
              ♾️ Lifetime Premium Access
            </p>

          </div>

          <div className="payPerks">

            {[
              {
                icon: '📋',
                text: '20+ NEET tests',
              },
              {
                icon: '🧬',
                text: 'Botany, Zoology, Physics & Chemistry',
              },
              {
                icon: '📊',
                text: 'Instant score & performance analysis',
              },
              {
                icon: '🔁',
                text: 'Unlimited retries',
              },
              {
                icon: '📱',
                text: 'Mobile & desktop support',
              },
              {
                icon: '♾️',
                text: 'Lifetime access — no subscriptions',
              },
            ].map((p) => (
              <div
                key={p.text}
                className="payPerk"
              >

                <span className="payPerkIcon">
                  {p.icon}
                </span>

                <span className="payPerkText">
                  {p.text}
                </span>

              </div>
            ))}

          </div>

          <button
            className="payBtn"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : 'Pay ₹99 & Unlock Premium'}
          </button>

          <p className="payNote">
            Secure payment via Razorpay
          </p>

          <p className="payNoteSmall">
            Supports UPI, Cards, Netbanking & Wallets
          </p>

        </div>

      </main>

      <Footer />
    </div>
  )
}