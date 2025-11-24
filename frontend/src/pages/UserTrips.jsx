import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const statusColors = {
  completed: 'bg-green-100 text-green-700',
  ongoing: 'bg-blue-100 text-blue-700',
  accepted: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}

const formatDateTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString()
}

const UserTrips = () => {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/rides/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setTrips(res.data || [])
      } catch (err) {
        console.error(err)
        setError(
          err.response?.data?.message || 'Failed to load trips. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="w-full bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://pngimg.com/d/taxi_logos_PNG2.png"
              alt="Taxi"
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-lg font-semibold">Your trips</h1>
              <p className="text-xs text-gray-500">Ride history with Taxi</p>
            </div>
          </div>

          <Link
            to="/home"
            className="text-sm px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-100"
          >
            Back to app
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        {loading && <p className="text-sm text-gray-600">Loading trips...</p>}
        {error && (
          <p className="text-sm text-red-600 mb-3">
            {error}
          </p>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>No trips yet.</p>
            <p className="mt-2">
              <Link to="/home" className="text-black underline">
                Book your first ride with Taxi.
              </Link>
            </p>
          </div>
        )}

        <div className="space-y-3 mt-3">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="bg-white rounded-2xl p-4 shadow-sm border flex flex-col gap-2"
            >
              {/* Top row: date + fare + status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(trip.createdAt)}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {trip.pickup} → {trip.destination}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₹{trip.fare}</p>
                  <span
                    className={
                      'inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium ' +
                      (statusColors[trip.status] || 'bg-gray-100 text-gray-700')
                    }
                  >
                    {trip.status}
                  </span>
                </div>
              </div>

              {/* Captain / vehicle info */}
              <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                <div>
                  <p className="capitalize">
                    {trip.vehicleType ? `Taxi ${trip.vehicleType}` : 'Taxi ride'}
                  </p>
                  {trip.captain && (
                    <p className="mt-0.5">
                      Captain:{' '}
                      <span className="font-medium capitalize">
                        {trip.captain.fullname?.firstname}
                        {trip.captain.fullname?.lastname
                          ? ` ${trip.captain.fullname.lastname}`
                          : ''}
                      </span>
                    </p>
                  )}
                </div>
                {trip.captain?.vehicle?.plate && (
                  <p>
                    Vehicle:{' '}
                    <span className="font-medium">
                      {trip.captain.vehicle.plate}
                    </span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserTrips
