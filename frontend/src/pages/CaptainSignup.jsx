import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/CapatainContext'

const CaptainSignup = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [vehicleColor, setVehicleColor] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleCapacity, setVehicleCapacity] = useState('')
  const [vehicleType, setVehicleType] = useState('')

  const [loading, setLoading] = useState(false)

  const { setCaptain } = useContext(CaptainDataContext)

  const submitHandler = async (e) => {
    e.preventDefault()

    const captainData = {
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      email,
      password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType,
      },
    }

    try {
      setLoading(true)
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        captainData
      )

      if (response.status === 201) {
        const data = response.data
        setCaptain(data.captain)
        localStorage.setItem('token', data.token)
        navigate('/captain-home')
      } else {
        alert('Captain signup failed. Please try again.')
      }
    } catch (err) {
      console.error('Captain signup error:', err)
      alert(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          'Captain signup request failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <img
              className="w-12"
              src="https://pngimg.com/d/taxi_logos_PNG2.png"
              alt="Taxi"
            />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Become a Taxi Captain
              </h1>
              <p className="text-sm text-gray-500">
                Create your account and start earning on your own schedule.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-[11px] font-medium text-gray-600">
            Captain account
          </span>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="grid md:grid-cols-2 gap-5">
          {/* Left column – personal info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-800 mb-1 block">
                What&apos;s our Captain&apos;s name
              </label>
              <div className="flex gap-3">
                <input
                  required
                  className="bg-gray-50 w-1/2 rounded-xl px-4 py-2.5 border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  required
                  className="bg-gray-50 w-1/2 rounded-xl px-4 py-2.5 border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800 mb-1 block">
                What&apos;s our Captain&apos;s email
              </label>
              <input
                required
                className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 w-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-800 mb-1 block">
                Enter password
              </label>
              <input
                required
                className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 w-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Use a strong password that you don&apos;t reuse elsewhere.
              </p>
            </div>
          </div>

          {/* Right column – vehicle info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-800 mb-1 block">
                Vehicle information
              </label>
              <div className="flex gap-3 mb-3">
                <input
                  required
                  className="bg-gray-50 w-1/2 rounded-xl px-4 py-2.5 border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
                  type="text"
                  placeholder="Vehicle color"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                />
                <input
                  required
                  className="bg-gray-50 w-1/2 rounded-xl px-4 py-2.5 border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
                  type="text"
                  placeholder="Vehicle plate"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <input
                  required
                  className="bg-gray-50 w-1/2 rounded-xl px-4 py-2.5 border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
                  type="number"
                  placeholder="Vehicle capacity"
                  value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                />
                <select
                  required
                  className="bg-gray-50 w-1/2 rounded-xl px-4 py-2.5 border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="" disabled>
                    Select vehicle type
                  </option>
                  <option value="car">Car</option>
                  <option value="auto">Auto</option>
                  <option value="moto">Moto</option>
                </select>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-black text-white text-sm font-semibold py-2.5 hover:bg-black/90 disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create Captain Account'}
              </button>

              <p className="mt-3 text-xs text-gray-500 text-center">
                Already have a captain account?{' '}
                <Link
                  to="/captain-login"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CaptainSignup


