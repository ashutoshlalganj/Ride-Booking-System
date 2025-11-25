// src/pages/Home.jsx

import React, { useEffect, useRef, useState, useContext } from 'react'
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

  // middle column flags
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

  const { socket } = useContext(SocketContext)
  const { user } = useContext(UserDataContext)
  const navigate = useNavigate()

  // ✅ Socket listeners
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

  // ---------- AUTOCOMPLETE HANDLERS ----------

  const mapSuggestions = (data) => {
    if (Array.isArray(data)) {
      return data
        .map((item) =>
          typeof item === 'string' ? item : item.description || ''
        )
        .filter(Boolean)
    }

    if (Array.isArray(data?.predictions)) {
      return data.predictions
        .map((p) =>
          typeof p === 'string' ? p : p.description || ''
        )
        .filter(Boolean)
    }

    return []
  }

  const handlePickupChange = async (e) => {
    const value = e.target.value
    setPickup(value)

    if (value.trim().length < 3) {
      setPickupSuggestions([])
      return
    }

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

      const list = mapSuggestions(response.data)
      setPickupSuggestions(list)
    } catch (err) {
      console.error('Pickup suggestions error:', err)
      setPickupSuggestions([])
    }
  }

  const handleDestinationChange = async (e) => {
    const value = e.target.value
    setDestination(value)

    if (value.trim().length < 3) {
      setDestinationSuggestions([])
      return
    }

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

      const list = mapSuggestions(response.data)
      setDestinationSuggestions(list)
    } catch (err) {
      console.error('Destination suggestions error:', err)
      setDestinationSuggestions([])
    }
  }

  const submitHandler = (e) => {
    e.preventDefault()
  }

  const quickDestinations = [
    { label: 'Home', value: 'Home', type: 'destination' },
    { label: 'Work', value: 'Work', type: 'destination' },
    { label: 'Current location', value: 'Current location', type: 'pickup' },
  ]

  async function findTrip() {
    if (!pickup || !destination) return

    try {
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

      setVehiclePanel(true)
      setConfirmRidePanel(false)
      setVehicleFound(false)
      setWaitingForDriver(false)
      setPanelOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  async function createRide() {
    try {
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

      console.log('Ride created:', response.data)
    } catch (err) {
      console.error(err)
    }
  }

  // ------------------- MIDDLE COLUMN VIEW -------------------

  const renderCenterPanel = () => {
    if (vehiclePanel) {
      return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 h-max">
          <h2 className="text-xl font-semibold mb-2">Choose a Vehicle</h2>
          <p className="text-xs text-gray-500 mb-4">
            Select a ride that suits your budget and time.
          </p>
          <VehiclePanel
            selectVehicle={setVehicleType}
            fare={fare}
            setConfirmRidePanel={(val) => {
              if (val) {
                setConfirmRidePanel(true)
                setVehiclePanel(false)
              } else {
                setConfirmRidePanel(false)
              }
            }}
            setVehiclePanel={setVehiclePanel}
          />
        </div>
      )
    }

    if (confirmRidePanel) {
      return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 h-max">
          <ConfirmRide
            pickup={pickup}
            destination={destination}
            fare={fare}
            vehicleType={vehicleType}
            onBack={() => {
              setConfirmRidePanel(false)
              setVehiclePanel(true)
            }}
            onConfirm={async () => {
              await createRide()
              setConfirmRidePanel(false)
              setVehicleFound(true)
            }}
          />
        </div>
      )
    }

    if (vehicleFound) {
      return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 h-max">
          <LookingForDriver
            createRide={createRide}
            pickup={pickup}
            destination={destination}
            fare={fare}
            vehicleType={vehicleType}
            setVehicleFound={setVehicleFound}
          />
        </div>
      )
    }

    if (waitingForDriver) {
      return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 h-max">
          <WaitingForDriver
            ride={ride}
            setVehicleFound={setVehicleFound}
            setWaitingForDriver={setWaitingForDriver}
            waitingForDriver={waitingForDriver}
          />
        </div>
      )
    }

    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 text-sm text-gray-500">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Choose a ride
        </h2>
        <p>
          Enter your pick-up and destination on the left, then tap{' '}
          <span className="font-semibold">Find Trip</span> to view available
          vehicles here.
        </p>
      </div>
    )
  }

  // ------------------- JSX LAYOUT -------------------

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col md:flex-row">
      {/* LEFT: Find a trip */}
      <div className="w-full md:w-[32%] md:h-full flex items-end md:items-start md:justify-end relative">
        <div className="w-full md:w-[90%] max-w-md mx-auto md:mx-0 bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.18)] md:shadow-xl border border-gray-100 p-5 md:p-6 mt-4 md:mt-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                className="w-10"
                src="https://pngimg.com/d/taxi_logos_PNG2.png"
                alt="Taxi"
              />
              <div>
                <h4 className="text-lg font-semibold">Find a trip</h4>
                <p className="text-xs text-gray-500">
                  {user?.fullname?.firstname
                    ? `Hi, ${user.fullname.firstname}. Where to?`
                    : 'Set your pickup and destination to get started.'}
                </p>
              </div>
            </div>
          </div>

          <form
            className="relative py-2"
            onSubmit={(e) => {
              submitHandler(e)
            }}
          >
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

          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={findTrip}
              className="flex-1 bg-black text-white text-sm md:text-base font-semibold py-2.5 rounded-xl hover:bg-black/90"
            >
              Find Trip
            </button>

            <button
              type="button"
              className="md:w-40 inline-flex items-center justify-center rounded-xl border text-xs md:text-sm font-medium text-gray-800 py-2.5 bg-white hover:bg-gray-50"
            >
              <i className="ri-time-line mr-1" />
              Schedule
            </button>
          </div>
        </div>

        {panelOpen && (
          <div
            ref={panelRef}
            className="absolute left-0 right-0 bottom-0 md:left-1/2 md:-translate-x-1/2 md:w-[90%] max-w-md bg-white rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.18)] overflow-hidden z-20"
          >
            <LocationSearchPanel
              suggestions={
                activeField === 'pickup'
                  ? pickupSuggestions
                  : destinationSuggestions
              }
              setPanelOpen={setPanelOpen}
              setPickup={setPickup}
              setDestination={setDestination}
              activeField={activeField}
            />
          </div>
        )}
      </div>

      {/* MIDDLE column – desktop */}
      <div className="hidden md:flex w-[36%] md:h-full items-start justify-center pt-10">
        {renderCenterPanel()}
      </div>

      {/* MOBILE center */}
      <div className="md:hidden w-full px-3 pb-3">
        {renderCenterPanel()}
      </div>

      {/* RIGHT: Map */}
      <div className="w-full md:w-[32%] h-[40vh] md:h-full">
        <LiveTracking pickup={pickup} destination={destination} />
      </div>
    </div>
  )
}

export default Home
