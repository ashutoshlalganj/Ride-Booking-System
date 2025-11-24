import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'

const UserSignup = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { setUser } = useContext(UserDataContext)
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()

    // ⚠️ IMPORTANT: backend jo body expect karta hai
    const payload = {
      fullname: {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
      },
      email: email.trim(),
      password, // min 6 chars (backend rule)
    }

    try {
      setLoading(true)

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        payload
      )

      // Success
      const data = res.data
      setUser(data.user)
      localStorage.setItem('token', data.token)

      navigate('/home')
    } catch (err) {
      console.error('Signup error:', err)

      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Signup request failed.'

      alert(msg)
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
            Rider account
          </p>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create your Taxi account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign up to start booking rides instantly.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-800 mb-1 block">
                What&apos;s your name
              </label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 w-full text-sm focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
                type="text"
                placeholder="First name"
              />
            </div>
            <div className="pt-6 sm:pt-0">
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 w-full text-sm mt-[1.35rem] sm:mt-0 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
                type="text"
                placeholder="Last name (optional)"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-800 mb-1 block">
              What&apos;s your email
            </label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 w-full text-sm focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
              type="email"
              placeholder="email@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-800 mb-1 block">
              Enter password
            </label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 w-full text-sm focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
              type="password"
              placeholder="At least 6 characters"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Use at least 6 characters with a mix of letters and numbers.
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-black text-white text-sm font-semibold py-2.5 hover:bg-black/90 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Bottom links */}
        <div className="mt-6 space-y-2 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-medium underline">
              Login here
            </Link>
          </p>

          <p className="text-xs text-gray-500">
            Are you a captain?{' '}
            <Link
              to="/captain-signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up as Captain
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
  
}

export default UserSignup
