import React, { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

import FinishRide from '../components/FinishRide'
import LiveTracking from '../components/LiveTracking'

const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false)
  const finishRidePanelRef = useRef(null)
  const location = useLocation()
  const rideData = location.state?.ride

  useGSAP(
    () => {
      if (finishRidePanel) {
        gsap.to(finishRidePanelRef.current, {
          y: 0,
          duration: 0.25,
          ease: 'power2.out',
        })
      } else {
        gsap.to(finishRidePanelRef.current, {
          y: '100%',
          duration: 0.25,
          ease: 'power2.in',
        })
      }
    },
    { dependencies: [finishRidePanel] }
  )

  const passengerName = rideData?.user?.fullname?.firstname || 'Rider'
  const pickup = rideData?.pickup || 'Pickup location'
  const destination = rideData?.destination || 'Destination'
  const fare = rideData?.fare || 0

  return (
    <div className="min-h-screen relative bg-black">
      {/* Map background */}
      <div className="absolute inset-0">
        <LiveTracking pickup={pickup} destination={destination} />
      </div>

      {/* Top overlay bar */}
      <header className="relative z-10 px-4 pt-4 pb-3 flex items-center justify-between">
        <Link
          to="/captain-home"
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow"
        >
          <i className="ri-arrow-left-line text-lg" />
        </Link>
        <div className="px-3 py-1 rounded-full bg-black/70 text-white text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          On trip
        </div>
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow">
          <i className="ri-more-2-line text-lg" />
        </div>
      </header>

      {/* Bottom trip info card */}
      <div className="relative z-10 mt-[50vh] px-4 pb-4">
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_35px_rgba(0,0,0,0.4)] px-4 pt-3 pb-4">
          <div className="flex justify-center">
            <div className="w-10 h-1 rounded-full bg-gray-300 mb-3" />
          </div>

          {/* ETA + fare row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">Estimated fare</p>
              <p className="text-lg font-semibold">₹{fare}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-semibold text-green-600">
                En route to drop
              </p>
            </div>
          </div>

          {/* Pickup / Drop card */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-3 mb-3 space-y-2 text-sm">
            <div className="flex gap-3 items-start">
              <span className="mt-1 w-2 h-2 rounded-full bg-green-500" />
              <div>
                <p className="text-[11px] uppercase font-semibold text-gray-500">
                  Pickup
                </p>
                <p className="text-gray-800">{pickup}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="mt-1 w-2 h-2 rounded-full bg-black" />
              <div>
                <p className="text-[11px] uppercase font-semibold text-gray-500">
                  Drop
                </p>
                <p className="text-gray-800">{destination}</p>
              </div>
            </div>
          </div>

          {/* Rider row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/100?img=12"
                alt="Rider"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">{passengerName}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <i className="ri-star-fill text-yellow-400 text-xs" />
                  4.8 rating
                </p>
              </div>
            </div>
            <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center">
              <i className="ri-phone-line text-lg text-gray-800" />
            </button>
          </div>

          {/* Complete ride button */}
          <button
            onClick={() => setFinishRidePanel(true)}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-green-700"
          >
            Complete ride
          </button>
        </div>
      </div>

      {/* Finish ride bottom sheet */}
      <div
        ref={finishRidePanelRef}
        className="fixed inset-x-0 bottom-0 z-[50] translate-y-full bg-white px-3 py-10 pt-12 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.4)]"
      >
        <FinishRide ride={rideData} setFinishRidePanel={setFinishRidePanel} />
      </div>
    </div>
  )
}

export default CaptainRiding
