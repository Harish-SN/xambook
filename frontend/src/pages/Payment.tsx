// src/pages/Payment.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

import keycloak from '../lib/keycloak'

import '../styles/Payment.css'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function Payment() {
  const navigate = useNavigate()

  const [loading, setLoading] =
    useState(false)

  async function handlePayment() {

    setLoading(true)

    try {

      const token = keycloak.token

      if (!token) {

        alert('Please login first')

        return
      }

      // =====================================
      // GET RAZORPAY CONFIG
      // =====================================

      const configRes = await fetch(
        'https://api.xambook.com/api/payment/config',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!configRes.ok) {

        throw new Error(
          'Failed to load payment config'
        )
      }

      const config =
        await configRes.json()

      // =====================================
      // CREATE ORDER
      // =====================================

      const res = await fetch(
        'https://api.xambook.com/api/payment/create-order',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {

        const text = await res.text()

        console.error(text)

        throw new Error(
          'Failed to create order'
        )
      }

      const order = await res.json()

      // =====================================
      // CHECK SDK
      // =====================================

      if (!window.Razorpay) {

        alert(
          'Razorpay SDK failed to load.'
        )

        return
      }

      // =====================================
      // RAZORPAY OPTIONS
      // =====================================

      const options = {

        key: config.key,

        amount: order.amount,

        currency: order.currency,

        name: 'XamBook',

        description:
          'Premium Access — ₹99 Lifetime Plan',

        order_id: order.id,

        handler: async function (
          response: any
        ) {

          try {

            const verify =
              await fetch(
                'https://api.xambook.com/api/payment/verify',
                {
                  method: 'POST',

                  headers: {
                    'Content-Type':
                      'application/json',

                    Authorization:
                      `Bearer ${token}`,
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
                '🎉 Payment successful!'
              )

              navigate('/dashboard')

            } else {

              const err =
                await verify.text()

              console.error(err)

              alert(
                'Payment verification failed.'
              )
            }

          } catch (err) {

            console.error(err)

            alert(
              'Verification failed.'
            )
          }
        },

        prefill: {},

        theme: {
          color: '#4f46e5',
        },
      }

      // =====================================
      // OPEN RAZORPAY
      // =====================================

      const rzp =
        new window.Razorpay(options)

      rzp.open()

    } catch (err) {

      console.error(err)

      alert(
        'Payment failed. Check console.'
      )

    } finally {

      setLoading(false)
    }
  }

  return (
    <div className="payPage">

      <Navbar />

      <main className="payMain">

        <div className="payCard">

          <h1 className="payTitle">
            Go Premium
          </h1>

          <p className="paySub">
            Lifetime access for ₹99
          </p>

          <button
            className="payBtn"
            onClick={handlePayment}
            disabled={loading}
          >
            {
              loading
                ? 'Processing...'
                : 'Pay ₹99'
            }
          </button>

        </div>

      </main>

      <Footer />

    </div>
  )
}