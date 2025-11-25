// src/components/ConfirmRidePopUp.jsx

import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const getShortLabel = (address) => {
  if (!address) return ''
  const [first] = address.split(',')
  return first?.trim() || address
}

const getDistanceLabel = (ride) => {
  const raw =
    ride?.distanceText ||
    ride?.distance?.text ||
    ride?.distance ||
    ''

  if (!raw) return '— KM'
  const match = String(raw).match(/[\d.]+/)
  const num = match ? match[0] : null
  return num ? `${num} KM` : `${raw}`
}

const ConfirmRidePopUp = (props) => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const ride = props.ride || {}

  const distanceLabel = getDistanceLabel(ride)
  const pickupShort = getShortLabel(ride.pickup)
  const destinationShort = getShortLabel(ride.destination)

  const submitHander = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length < 4) {
      setError('Please enter valid OTP')
      return
    }

    try {
      setLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/start-ride`,
        {
          params: {
            rideId: ride._id,
            otp: otp,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (response.status === 200) {
        props.setConfirmRidePopupPanel(false)
        props.setRidePopupPanel(false)
        navigate('/captain-riding', { state: { ride } })
      }
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.message ||
          'Invalid OTP or unable to start ride.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0 cursor-pointer"
        onClick={() => {
          props.setConfirmRidePopupPanel(false)
        }}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className="text-2xl font-semibold mb-5">
        Confirm this ride to Start
      </h3>

      {/* Rider + distance */}
      <div className="flex items-center justify-between p-3 border-2 border-yellow-400 rounded-lg mt-4">
        <div className="flex items-center gap-3">
          <img
            className="h-12 rounded-full object-cover w-12"
            src="https://i.pinimg.com/736x/55/86/bc/5586bcc6bb651aca48029cc5d77e85fd.jpg"
            alt="user"
          />
          <h2 className="text-lg font-medium capitalize">
            {ride?.user?.fullname?.firstname}
          </h2>
        </div>
        <h5 className="text-lg font-semibold">{distanceLabel}</h5>
      </div>

      <div className="flex gap-2 justify-between flex-col items-center">
        <div className="w-full mt-5">
          {/* Pickup */}
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="ri-map-pin-user-fill"></i>
            <div>
              <h3 className="text-lg font-medium">{pickupShort}</h3>
              <p className="text-sm -mt-1 text-gray-600">
                {ride?.pickup}
              </p>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className="text-lg font-medium">{destinationShort}</h3>
              <p className="text-sm -mt-1 text-gray-600">
                {ride?.destination}
              </p>
            </div>
          </div>

          {/* Fare */}
          <div className="flex items-center gap-5 p-3">
            <i className="ri-currency-line"></i>
            <div>
              <h3 className="text-lg font-medium">₹{ride?.fare}</h3>
              <p className="text-sm -mt-1 text-gray-600">Cash</p>
            </div>
          </div>
        </div>

        <div className="mt-6 w-full">
          <form onSubmit={submitHander}>
            {/* OTP input – Uber style big field */}
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              className="bg-[#eee] px-6 py-4 font-mono text-lg rounded-lg w-full mt-3 tracking-[0.3em] text-center"
              placeholder="Enter OTP"
            />

            {error && (
              <p className="mt-2 text-xs text-red-600 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-5 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg disabled:opacity-60"
            >
              {loading ? 'Starting...' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => {
                props.setConfirmRidePopupPanel(false)
                props.setRidePopupPanel(false)
              }}
              className="w-full mt-2 bg-red-600 text-lg text-white font-semibold p-3 rounded-lg"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ConfirmRidePopUp
