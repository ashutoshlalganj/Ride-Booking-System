// src/pages/CaptainHome.jsx

import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

import LiveTracking from '../components/LiveTracking'
import RidePopUp from '../components/RidePopUp'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import CaptainDetails from '../components/CaptainDetails'

import { SocketContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CapatainContext'

const CaptainHome = () => {
  const { socket } = useContext(SocketContext)
  const { captain } = useContext(CaptainDataContext)

  const [isOnline, setIsOnline] = useState(false)

  const [ride, setRide] = useState(null)
  const [ridePopupPanel, setRidePopupPanel] = useState(false)
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false)

  const ridePopupPanelRef = useRef(null)
  const confirmRidePopupPanelRef = useRef(null)

  // stats
  const [todayTrips, setTodayTrips] = useState(0)
  const [todayEarnings, setTodayEarnings] = useState(0)
  const [onlineMinutes, setOnlineMinutes] = useState(0)
  const [totalTrips, setTotalTrips] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)

  // ------------ summary API ------------
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/captains/summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = res.data || {}
        setTodayTrips(data.todayTrips || 0)
        setTodayEarnings(data.todayEarnings || 0)
        setOnlineMinutes(data.onlineMinutes || 0)
        setTotalTrips(data.totalTrips || 0)
        setTotalEarnings(data.totalEarnings || 0)

        // backend status ke hisaab se toggle
        if (data.status === 'active') {
          setIsOnline(true)
        } else {
          setIsOnline(false)
        }
      } catch (err) {
        console.error('Captain summary error:', err)
      }
    }

    fetchSummary()
  }, [])

  // ------------ SOCKET: join room ------------
  useEffect(() => {
    if (!socket || !captain?._id) return

    socket.emit('join', {
      userId: captain._id,
      userType: 'captain',
    })
  }, [socket, captain])

  // ------------ SOCKET: location update only when ONLINE ------------
  useEffect(() => {
    if (!socket || !captain?._id || !isOnline) return

    const updateLocation = () => {
      if (!navigator.geolocation) return

      navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('update-location-captain', {
          userId: captain._id,
          location: {
            ltd: position.coords.latitude,
            lng: position.coords.longitude,
          },
        })
      })
    }

    updateLocation()
    const id = setInterval(updateLocation, 10000)
    return () => clearInterval(id)
  }, [socket, captain, isOnline])

  // ------------ SOCKET: new-ride listener (only Online) ------------
  useEffect(() => {
    if (!socket || !captain?._id) return

    const handleNewRide = (data) => {
      if (!isOnline) return
      setRide(data)
      setRidePopupPanel(true)
    }

    if (isOnline) {
      socket.on('new-ride', handleNewRide)
    }

    return () => {
      socket.off('new-ride', handleNewRide)
    }
  }, [socket, captain, isOnline])

  // ------------ Confirm ride API ------------
  async function confirmRide() {
    if (!ride || !captain?._id) return

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
        {
          rideId: ride._id,
          captainId: captain._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      setRidePopupPanel(false)
      setConfirmRidePopupPanel(true)
    } catch (err) {
      console.error('Confirm ride error:', err)
      alert('Failed to confirm ride. Please try again.')
    }
  }

  // ------------ GSAP animations ------------
  useGSAP(
    () => {
      if (ridePopupPanel) {
        gsap.to(ridePopupPanelRef.current, {
          y: 0,
          duration: 0.25,
          ease: 'power2.out',
        })
      } else {
        gsap.to(ridePopupPanelRef.current, {
          y: '100%',
          duration: 0.25,
          ease: 'power2.in',
        })
      }
    },
    { dependencies: [ridePopupPanel] }
  )

  useGSAP(
    () => {
      if (confirmRidePopupPanel) {
        gsap.to(confirmRidePopupPanelRef.current, {
          y: 0,
          duration: 0.25,
          ease: 'power2.out',
        })
      } else {
        gsap.to(confirmRidePopupPanelRef.current, {
          y: '100%',
          duration: 0.25,
          ease: 'power2.in',
        })
      }
    },
    { dependencies: [confirmRidePopupPanel] }
  )

  // ------------ Online toggle (backend + UI) ------------
  const toggleOnline = async () => {
    const nextStatus = !isOnline ? 'active' : 'inactive'
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.patch(
          `${import.meta.env.VITE_BASE_URL}/captains/status`,
          { status: nextStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      }
      setIsOnline(!isOnline)

      if (isOnline) {
        // going offline → popups band
        setRidePopupPanel(false)
        setConfirmRidePopupPanel(false)
      }
    } catch (err) {
      console.error('Update captain status error:', err)
      alert('Failed to change status, please try again.')
    }
  }

  const statusLabel = isOnline ? 'You are online' : 'You are offline'
  const statusColor = isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
  const statusDot = isOnline ? 'bg-green-500' : 'bg-gray-400'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* TOP BAR */}
      <header className="flex items-center justify-between px-4 py-3 bg-black text-white">
        <div className="flex items-center gap-2">
          <img
            src="https://pngimg.com/d/taxi_logos_PNG2.png"
            alt="Logo"
            className="w-8 h-8"
          />
          <span className="text-lg font-semibold">Taxi Captain</span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusDot}`} />
            {isOnline ? 'Online' : 'Offline'}
          </div>

          {/* Logout icon – protected route `/captain/logout` */}
          <Link
            to="/captain/logout"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
            title="Logout"
          >
            <i className="ri-logout-box-r-line text-lg" />
          </Link>
        </div>
      </header>

      {/* MAP + OVERLAY */}
      <div className="relative flex-1">
        {/* Map */}
        <div className="absolute inset-0">
          <LiveTracking />
        </div>

        {/* Gradient for readability */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

        {/* Welcome + stats */}
        <div className="relative z-10 px-4 pt-4 flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-200">Welcome back,</p>
            <h2 className="text-xl font-semibold text-white">
              {captain?.fullname?.firstname || 'Captain'}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-black/70 rounded-2xl px-3 py-2.5 text-white">
              <p className="opacity-70">Today&apos;s Trips</p>
              <p className="mt-1 text-lg font-semibold">{todayTrips}</p>
            </div>
            <div className="bg-black/70 rounded-2xl px-3 py-2.5 text-white">
              <p className="opacity-70">Today&apos;s Earning</p>
              <p className="mt-1 text-lg font-semibold">₹{todayEarnings}</p>
            </div>
            <div className="bg-black/70 rounded-2xl px-3 py-2.5 text-white">
              <p className="opacity-70">Online</p>
              <p className="mt-1 text-lg font-semibold">
                {onlineMinutes}
                <span className="text-[11px] opacity-70 ml-1">min</span>
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SHEET */}
        <div className="relative z-10 mt-auto pt-4 pb-4 px-4">
          <div className="mt-[45vh] mb-2" />
          <div className="bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] px-4 pt-3 pb-4">
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Captain info card */}
            <CaptainDetails
              todayTrips={todayTrips}
              todayEarnings={todayEarnings}
              totalTrips={totalTrips}
              totalEarnings={totalEarnings}
              onlineMinutes={onlineMinutes}
            />

            {/* Online toggle */}
            <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {statusLabel}
                </p>
                <p className="text-xs text-gray-500">
                  {isOnline
                    ? 'You will start receiving ride requests.'
                    : 'Go online to start accepting rides.'}
                </p>
              </div>

              <button
                type="button"
                onClick={toggleOnline}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  isOnline ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    isOnline ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Ride types chips */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">
                You will receive requests for:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Taxi Ride', 'Intercity', 'Taxi Pool', 'Airport'].map(
                  (label) => (
                    <span
                      key={label}
                      className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700"
                    >
                      {label}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIDE POPUP */}
        <div
          ref={ridePopupPanelRef}
          className="fixed inset-x-0 bottom-0 z-20 translate-y-full bg-white px-3 py-10 pt-12 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.3)]"
        >
          <RidePopUp
            ride={ride}
            setRidePopupPanel={setRidePopupPanel}
            setConfirmRidePopupPanel={setConfirmRidePopupPanel}
            confirmRide={confirmRide}
          />
        </div>

        {/* CONFIRM RIDE POPUP */}
        <div
          ref={confirmRidePopupPanelRef}
          className="fixed inset-x-0 bottom-0 z-30 translate-y-full bg-white px-3 py-10 pt-12 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.35)] h-[75vh]"
        >
          <ConfirmRidePopUp
            ride={ride}
            setConfirmRidePopupPanel={setConfirmRidePopupPanel}
            setRidePopupPanel={setRidePopupPanel}
          />
        </div>
      </div>
    </div>
  )
}

export default CaptainHome
