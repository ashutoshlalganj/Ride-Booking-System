// src/pages/CaptainForgotPassword.jsx

import React, { useState } from 'react'
import axios from 'axios'

const CaptainForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/forgot-password`,
        { email }
      )

      setMessage(
        res.data.message ||
          'If this email exists, a reset link has been generated.'
      )

      // testing ke liye agar resetLink aaye to usse bhi dikhado
      if (res.data.resetLink) {
        setMessage(
          `${res.data.message} Reset link: ${res.data.resetLink}`
        )
      }
    } catch (err) {
      console.error(err)
      setMessage(
        err.response?.data?.message ||
          'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-7">
        <h1 className="text-2xl font-semibold mb-2 text-center">
          Captain – Forgot Password
        </h1>
        <p className="text-xs text-gray-500 mb-5 text-center">
          Enter your registered captain email. We&apos;ll send you a reset link
          (dev mode me link yahi dikhega).
        </p>

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Captain email
            </label>
            <input
              type="email"
              className="w-full border rounded-xl px-3 py-2.5 bg-gray-50 outline-none text-sm focus:ring-2 focus:ring-black/80"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-xs text-gray-700 whitespace-pre-wrap">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export default CaptainForgotPassword

