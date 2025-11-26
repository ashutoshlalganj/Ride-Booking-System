// src/pages/CaptainResetPassword.jsx

import React, { useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

const CaptainResetPassword = () => {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()
    setMessage('')

    if (password !== confirm) {
      setMessage('Passwords do not match')
      return
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/reset-password`,
        { token, password }
      )
      setMessage(res.data.message || 'Password reset successfully')

      setTimeout(() => navigate('/captain-login'), 2000)
    } catch (err) {
      console.error(err)
      setMessage(
        err.response?.data?.message ||
          'Failed to reset password. Try again.'
      )
    }
  }

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-7">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Captain – Reset Password
        </h1>

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              New password
            </label>
            <input
              type="password"
              className="w-full border rounded-xl px-3 py-2.5 bg-gray-50 outline-none text-sm focus:ring-2 focus:ring-black/80"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Confirm password
            </label>
            <input
              type="password"
              className="w-full border rounded-xl px-3 py-2.5 bg-gray-50 outline-none text-sm focus:ring-2 focus:ring-black/80"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-semibold"
          >
            Reset password
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-xs text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export default CaptainResetPassword