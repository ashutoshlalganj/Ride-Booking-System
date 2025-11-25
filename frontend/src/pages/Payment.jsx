// src/pages/Payment.jsx

import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import LiveTracking from '../components/LiveTracking'

const Payment = () => {
  const location = useLocation()
  const { ride } = location.state || {}
  const navigate = useNavigate()

  // agar ride data nahi mila (direct URL open kiya ho)
  if (!ride) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-600">
          Payment session not found. Please start a ride again.
        </p>
        <Link
          to="/home"
          className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold"
        >
          Go to Home
        </Link>
      </div>
    )
  }

  const [method, setMethod] = useState('Cash')
  const [isPaying, setIsPaying] = useState(false)

  const destinationShort =
    ride?.destination?.split(',')[0] || ride?.destination || ''

  const vehicleType = ride?.captain?.vehicle?.vehicleType
  const vehicleColor = ride?.captain?.vehicle?.color
  const vehicleLabel = [
    vehicleColor,
    vehicleType && vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1),
  ]
    .filter(Boolean)
    .join(' ') || 'Your ride'

  const handlePay = async () => {
    // yahan future me real payment gateway integrate kar sakte ho
    setIsPaying(true)
    try {
      // fake delay jaisa feel ke liye
      await new Promise((res) => setTimeout(res, 700))
      alert('Payment completed. Thank you for riding!')
      navigate('/home')
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* TOP: small bar with back/home (optional) */}
      <div className="absolute left-3 top-3 z-20">
        <Link
          to="/home"
          className="h-9 w-9 rounded-full bg-white shadow flex items-center justify-center"
        >
          <i className="ri-home-5-line text-lg" />
        </Link>
      </div>

      {/* MAP TOP HALF – Uber style */}
      <div className="h-1/2 relative">
        <LiveTracking />
      </div>

      {/* PAYMENT CARD BOTTOM HALF */}
      <div className="h-1/2 px-4 pb-5 pt-4 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
          {/* Driver / vehicle info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                className="h-11 w-11 rounded-full object-cover"
                src="https://i.pravatar.cc/100?img=12"
                alt="captain"
              />
              <div>
                <h2 className="text-base font-semibold capitalize">
                  {ride?.captain?.fullname?.firstname}{' '}
                  {ride?.captain?.fullname?.lastname}
                </h2>
                <p className="text-xs text-gray-500">
                  {vehicleLabel}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h4 className="text-base font-semibold">
                {ride?.captain?.vehicle?.plate}
              </h4>
              <p className="text-xs text-gray-500">Plate number</p>
            </div>
          </div>

          {/* Destination + fare */}
          <div className="mt-2">
            <div className="flex items-center gap-4 p-3 border-b">
              <i className="ri-map-pin-2-fill text-lg" />
              <div>
                <h3 className="text-sm font-medium">{destinationShort}</h3>
                <p className="text-xs -mt-0.5 text-gray-600">
                  {ride?.destination}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 border-b">
              <i className="ri-currency-line text-lg" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Trip fare
                  </p>
                  <h3 className="text-base font-semibold">
                    ₹{ride?.fare}
                  </h3>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Payment method
                  </p>
                  <p className="text-sm font-medium">{method}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment method selector – Uber style pills */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-1">Choose how to pay</p>
            <div className="flex gap-2 flex-wrap">
              {['Cash', 'UPI', 'Card'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                    method === m
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {method !== 'Cash' && (
              <p className="mt-1 text-[11px] text-gray-400">
                (Demo mode: payment will still be simulated, no real charge.)
              </p>
            )}
          </div>

          {/* Total row */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Amount to pay
            </p>
            <p className="text-xl font-semibold">₹{ride?.fare}</p>
          </div>

          {/* Pay button */}
          <button
            type="button"
            onClick={handlePay}
            disabled={isPaying}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60"
          >
            {isPaying ? 'Processing…' : 'Pay & Finish'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Payment


