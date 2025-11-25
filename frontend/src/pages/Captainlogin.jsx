import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/CapatainContext'

const Captainlogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { setCaptain } = useContext(CaptainDataContext)
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()

    const captain = { email, password }

    try {
      setLoading(true)
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        captain
      )

      if (response.status === 200) {
        const data = response.data
        setCaptain(data.captain)
        localStorage.setItem('token', data.token)
        navigate('/captain-home')
      } else {
        alert('Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Captain login error:', err)
      alert(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          'Login request failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            className="w-12 mb-2"
            src="https://pngimg.com/d/taxi_logos_PNG2.png"
            alt="Taxi"
          />
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Captain account
          </p>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Sign in to drive
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Access your captain dashboard and start accepting rides.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-800 mb-1 block">
              What&apos;s your email
            </label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 w-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
              type="email"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800 mb-1 block">
              Enter password
            </label>
            <input
              className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 w-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              placeholder="password"
            />

            {/* Captain specific forgot password */}
            <div className="mt-1 flex justify-end">
              <Link
                to="/captain-forgot-password"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-black text-white text-sm font-semibold py-2.5 hover:bg-black/90 disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login as Captain'}
          </button>
        </form>

        {/* Bottom links */}
        <div className="mt-6 space-y-2 text-center text-sm">
          <p className="text-gray-600">
            New to Taxi as a captain?{' '}
            <Link
              to="/captain-signup"
              className="text-black font-medium underline"
            >
              Register as Captain
            </Link>
          </p>

          <p className="text-xs text-gray-500">
            Want to book rides instead?{' '}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign in as User
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Captainlogin
