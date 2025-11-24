import React, { useEffect, useRef, useState, useContext } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import axios from 'axios'
import 'remixicon/fonts/remixicon.css'

import LocationSearchPanel from '../components/LocationSearchPanel'
import VehiclePanel from '../components/VehiclePanel'
import ConfirmRide from '../components/ConfirmRide'
import LookingForDriver from '../components/LookingForDriver'
import WaitingForDriver from '../components/WaitingForDriver'
import LiveTracking from '../components/LiveTracking'

import { SocketContext } from '../context/SocketContext'
import { UserDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')

  const [panelOpen, setPanelOpen] = useState(false)
  const [vehiclePanel, setVehiclePanel] = useState(false)
  const [confirmRidePanel, setConfirmRidePanel] = useState(false)
  const [vehicleFound, setVehicleFound] = useState(false)
  const [waitingForDriver, setWaitingForDriver] = useState(false)

  const [pickupSuggestions, setPickupSuggestions] = useState([])
  const [destinationSuggestions, setDestinationSuggestions] = useState([])
  const [activeField, setActiveField] = useState(null)

  const [fare, setFare] = useState({})
  const [vehicleType, setVehicleType] = useState(null)
  const [ride, setRide] = useState(null)

  const panelRef = useRef(null)
  const panelCloseRef = useRef(null)
  const vehiclePanelRef = useRef(null)
  const confirmRidePanelRef = useRef(null)
  const vehicleFoundRef = useRef(null)
  const waitingForDriverRef = useRef(null)

  const { socket } = useContext(SocketContext)
  const { user } = useContext(UserDataContext)
  const navigate = useNavigate()

  // ✅ Socket listeners ko useEffect ke andar rakha
  useEffect(() => {
    if (!socket || !user?._id) return

    socket.emit('join', { userType: 'user', userId: user._id })

    const onRideConfirmed = (rideData) => {
      setVehicleFound(false)
      setWaitingForDriver(true)
      setRide(rideData)
    }

    const onRideStarted = (rideData) => {
      setWaitingForDriver(false)
      navigate('/riding', { state: { ride: rideData } })
    }

    socket.on('ride-confirmed', onRideConfirmed)
    socket.on('ride-started', onRideStarted)

    return () => {
      socket.off('ride-confirmed', onRideConfirmed)
      socket.off('ride-started', onRideStarted)
    }
  }, [socket, user, navigate])

  const handlePickupChange = async (e) => {
    const value = e.target.value
    setPickup(value)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params: { input: value },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      setPickupSuggestions(response.data)
    } catch {
      // ignore
    }
  }

  const handleDestinationChange = async (e) => {
    const value = e.target.value
    setDestination(value)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params: { input: value },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      setDestinationSuggestions(response.data)
    } catch {
      // ignore
    }
  }

  const submitHandler = (e) => {
    e.preventDefault()
  }

  // 🔹 GSAP animations – panel open/close
  useGSAP(
    () => {
      if (panelOpen) {
        gsap.to(panelRef.current, {
          height: '60%',
          padding: 16,
        })
        gsap.to(panelCloseRef.current, {
          opacity: 1,
        })
      } else {
        gsap.to(panelRef.current, {
          height: '0%',
          padding: 0,
        })
        gsap.to(panelCloseRef.current, {
          opacity: 0,
        })
      }
    },
    [panelOpen]
  )

  useGSAP(
    () => {
      gsap.to(vehiclePanelRef.current, {
        transform: vehiclePanel ? 'translateY(0)' : 'translateY(100%)',
      })
    },
    [vehiclePanel]
  )

  useGSAP(
    () => {
      gsap.to(confirmRidePanelRef.current, {
        transform: confirmRidePanel ? 'translateY(0)' : 'translateY(100%)',
      })
    },
    [confirmRidePanel]
  )

  useGSAP(
    () => {
      gsap.to(vehicleFoundRef.current, {
        transform: vehicleFound ? 'translateY(0)' : 'translateY(100%)',
      })
    },
    [vehicleFound]
  )

  useGSAP(
    () => {
      gsap.to(waitingForDriverRef.current, {
        transform: waitingForDriver ? 'translateY(0)' : 'translateY(100%)',
      })
    },
    [waitingForDriver]
  )

  // 🔹 Uber-style extra quick destinations (frontend feature)
  const quickDestinations = [
    { label: 'Home', value: 'Home', type: 'destination' },
    { label: 'Work', value: 'Work', type: 'destination' },
    { label: 'Current location', value: 'Current location', type: 'pickup' },
  ]

  async function findTrip() {
    if (!pickup || !destination) return

    setVehiclePanel(true)
    setPanelOpen(false)

    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
      {
        params: { pickup, destination },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )

    setFare(response.data)
  }

  async function createRide() {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/rides/create`,
      {
        pickup,
        destination,
        vehicleType,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )

    // backend ride creation ho raha hai; baaki flow sockets se control hoga
    console.log('Ride created:', response.data)
  }

  return (
    <div className="h-screen w-full relative bg-gray-50 overflow-hidden">
      {/* Map area – pure background like Uber app */}
      <div className="h-1/2 md:h-full w-full md:w-3/5 md:fixed md:right-0">
        <LiveTracking />
      </div>

      {/* Booking panel – bottom card like Uber */}
      <div className="absolute inset-x-0 bottom-0 md:left-0 md:w-2/5 md:h-full flex items-end md:items-center">
        <div className="w-full max-w-xl mx-auto bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.18)] border border-gray-100 p-5 md:p-6">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                className="w-10"
                src="https://pngimg.com/d/taxi_logos_PNG2.png"
                alt="Taxi"
              />
              <div>
                <h4 className="text-lg font-semibold">
                  Find a trip
                </h4>
                <p className="text-xs text-gray-500">
                  {user?.fullname?.firstname
                    ? `Hi, ${user.fullname.firstname}. Where to?`
                    : 'Set your pickup and destination to get started.'}
                </p>
              </div>
            </div>

            <button
              ref={panelCloseRef}
              onClick={() => setPanelOpen(false)}
              className="text-xl text-gray-500 hover:text-black opacity-0 transition-opacity"
            >
              <i className="ri-arrow-down-s-line" />
            </button>
          </div>

          {/* Form */}
          <form
            className="relative py-2"
            onSubmit={(e) => {
              submitHandler(e)
            }}
          >
            {/* vertical line design */}
            <div className="line absolute h-16 w-[2px] top-[50%] -translate-y-1/2 left-6 bg-gray-500 rounded-full" />

            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black" />
                <input
                  onClick={() => {
                    setPanelOpen(true)
                    setActiveField('pickup')
                  }}
                  value={pickup}
                  onChange={handlePickupChange}
                  className="bg-gray-100 pl-8 pr-3 py-2.5 text-sm md:text-base rounded-xl w-full border border-transparent focus:outline-none focus:ring-2 focus:ring-black/80 focus:bg-white"
                  type="text"
                  placeholder="Add a pick-up location"
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-700" />
                <input
                  onClick={() => {
                    setPanelOpen(true)
                    setActiveField('destination')
                  }}
                  value={destination}
                  onChange={handleDestinationChange}
                  className="bg-gray-100 pl-8 pr-3 py-2.5 text-sm md:text-base rounded-xl w-full border border-transparent focus:outline-none focus:ring-2 focus:ring-black/80 focus:bg-white"
                  type="text"
                  placeholder="Enter your destination"
                />
              </div>
            </div>
          </form>

          {/* Quick shortcuts – Uber style chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {quickDestinations.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.type === 'pickup') setPickup(item.value)
                  else setDestination(item.value)
                }}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <button
              onClick={findTrip}
              className="flex-1 bg-black text-white text-sm md:text-base font-semibold py-2.5 rounded-xl hover:bg-black/90"
            >
              Find Trip
            </button>

            {/* future: schedule ride – abhi sirf UI */}
            <button
              type="button"
              className="md:w-40 inline-flex items-center justify-center rounded-xl border text-xs md:text-sm font-medium text-gray-800 py-2.5 bg-white hover:bg-gray-50"
            >
              <i className="ri-time-line mr-1" />
              Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Location search overlay panel */}
      <div
        ref={panelRef}
        className="bg-white h-0 w-full max-w-xl mx-auto fixed left-1/2 -translate-x-1/2 bottom-0 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.18)] overflow-hidden"
      >
        <LocationSearchPanel
          suggestions={
            activeField === 'pickup' ? pickupSuggestions : destinationSuggestions
          }
          setPanelOpen={setPanelOpen}
          setVehiclePanel={setVehiclePanel}
          setPickup={setPickup}
          setDestination={setDestination}
          activeField={activeField}
        />
      </div>

      {/* Vehicle selection panel */}
      <div
        ref={vehiclePanelRef}
        className="fixed w-full max-w-xl mx-auto left-1/2 -translate-x-1/2 z-10 bottom-0 translate-y-full bg-white px-3 py-8 pt-10 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.18)]"
      >
        <VehiclePanel
          selectVehicle={setVehicleType}
          fare={fare}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehiclePanel={setVehiclePanel}
        />
      </div>

      {/* Confirm ride panel */}
      <div
        ref={confirmRidePanelRef}
        className="fixed w-full max-w-xl mx-auto left-1/2 -translate-x-1/2 z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-10 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.18)]"
      >
        <ConfirmRide
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehicleFound={setVehicleFound}
        />
      </div>

      {/* Looking for driver panel */}
      <div
        ref={vehicleFoundRef}
        className="fixed w-full max-w-xl mx-auto left-1/2 -translate-x-1/2 z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-10 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.18)]"
      >
        <LookingForDriver
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setVehicleFound={setVehicleFound}
        />
      </div>

      {/* Waiting for driver panel */}
      <div
        ref={waitingForDriverRef}
        className="fixed w-full max-w-xl mx-auto left-1/2 -translate-x-1/2 z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-10 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.18)]"
      >
        <WaitingForDriver
          ride={ride}
          setVehicleFound={setVehicleFound}
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}
        />
      </div>
    </div>
  )
}

export default Home
