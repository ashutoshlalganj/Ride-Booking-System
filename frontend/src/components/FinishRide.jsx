// src/components/FinishRide.jsx

import React from 'react'
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

const FinishRide = (props) => {
  const navigate = useNavigate()
  const ride = props.ride || {}

  const distanceLabel = getDistanceLabel(ride)
  const pickupShort = getShortLabel(ride.pickup)
  const destinationShort = getShortLabel(ride.destination)

  async function endRide() {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
        {
          rideId: ride._id,
        },
        {
          headers: {
            // ⚠️ CAPTAIN ka token (login ke baad jo store kiya hai)
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      console.log('End ride response:', response.data)

      if (response.status === 200) {
        // panel band + captain home
        props.setFinishRidePanel(false)
        navigate('/captain-home')
      } else {
        alert(
          response.data?.message ||
            'Failed to finish ride. Please try again.'
        )
      }
    } catch (err) {
      console.error('End ride error:', err)
      alert(
        err.response?.data?.message ||
          'Failed to finish ride. Please try again.'
      )
    }
  }

  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0 cursor-pointer"
        onClick={() => {
          props.setFinishRidePanel(false)
        }}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className="text-2xl font-semibold mb-5">Finish this Ride</h3>

      {/* Rider row */}
      <div className="flex items-center justify-between p-4 border-2 border-yellow-400 rounded-lg mt-4">
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

        <div className="mt-10 w-full">
          <button
            onClick={endRide}
            className="w-full mt-5 flex text-lg justify-center bg-green-600 text-white font-semibold p-3 rounded-lg"
          >
            Finish Ride
          </button>
        </div>
      </div>
    </div>
  )
}

export default FinishRide
