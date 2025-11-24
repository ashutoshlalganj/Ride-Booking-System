// frontend/src/pages/Start.jsx
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Start = () => {
  const navigate = useNavigate()

  // Reserve section ke liye state
  const [reserveDate, setReserveDate] = useState('')
  const [reserveTime, setReserveTime] = useState('')

  // Mini booking form ke liye state
  const [pickup, setPickup] = useState('Your current location')
  const [drop, setDrop] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState('ride') // ride | reserve | intercity

  // GPS related state
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState('')

  // --------- GPS se current location auto set (page load pe ek try) ----------
  useEffect(() => {
    handleUseCurrentLocation(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Browser se current location lene wala function
  const handleUseCurrentLocation = (showAlertOnError = true) => {
    if (!navigator.geolocation) {
      setLocError('Location is not supported in your browser')
      if (showAlertOnError) {
        alert('Your browser does not support location access.')
      }
      return
    }

    setLocLoading(true)
    setLocError('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const lat = latitude.toFixed(4)
        const lng = longitude.toFixed(4)

        setPickup(`Your current location (${lat}, ${lng})`)
        setLocLoading(false)
      },
      (err) => {
        console.error(err)
        setLocLoading(false)
        setLocError('Unable to fetch current location')
        if (showAlertOnError) {
          if (err.code === 1) {
            alert(
              'Location permission denied. You can type your pickup manually.'
            )
          } else {
            alert('Could not get your location. Please try again or type manually.')
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  // Reserve button click
  const handleReserve = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    if (!reserveDate || !reserveTime) {
      alert('Please choose date and time')
      return
    }

    // Future me yahan schedule API laga sakte ho
    navigate('/home', {
      state: { reserveDate, reserveTime },
    })
  }

  // See prices (mini booking form)
  const handleSeePrices = () => {
    if (!pickup || !drop) {
      alert('Please enter pickup and drop locations')
      return
    }

    const token = localStorage.getItem('token')

    // Agar login nahi, to login pe bhej do, saath me locations bhi
    if (!token) {
      navigate('/login', {
        state: { from: 'start-prices', pickup, drop },
      })
    } else {
      // Agar login hai to directly app (Home) pe jao
      navigate('/home', {
        state: { pickup, drop },
      })
    }
  }

  return (
    <div className="min-h-screen w-full bg-white text-black">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 md:pt-28 pb-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
              Go anywhere with <span className="text-yellow-600">Taxi</span>
            </h1>
            <p className="text-gray-700 mb-6">
              Book safe, reliable rides in minutes. Whether you&apos;re heading
              to work, home, or out with friends, Taxi gets you there.
            </p>

            {/* Quick CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-black text-white font-semibold"
              >
                Book a ride
              </Link>
              <Link
                to="/captain-login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border font-semibold"
              >
                Drive with Taxi
              </Link>
            </div>

            {/* Small note */}
            <p className="text-xs text-gray-500 mt-4">
              Already riding with us? Go to{' '}
              <Link to="/home" className="underline">
                Taxi app
              </Link>
              .
            </p>
          </div>

          {/* Right side image / illustration */}
          <div className="flex justify-center">
            <img
              src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
              alt="Taxi ride"
              className="w-full max-w-md rounded-3xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Suggestions + mini booking (Uber style) */}
      <section id="ride" className="border-t bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-[2fr,3fr] gap-8">
          {/* Left – small booking form */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Go anywhere with Taxi
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Pickup now
                </label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-xs">
                    <i className="ri-time-line" />
                  </span>
                  <span className="text-xs text-gray-600">
                    Default pickup is set to “Now”
                  </span>
                </div>
              </div>

              {/* pickup input + GPS icon */}
              <div className="relative">
                <input
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 pr-10 text-sm text-gray-800 border border-transparent focus:border-black outline-none"
                  placeholder="Pickup location"
                />
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation(true)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-600 text-lg"
                  title="Use current location"
                >
                  {locLoading ? (
                    <i className="ri-loader-4-line animate-spin" />
                  ) : (
                    <i className="ri-crosshair-2-line" />
                  )}
                </button>
              </div>
              {locError && (
                <p className="text-[11px] text-red-500">{locError}</p>
              )}

              {/* drop input */}
              <input
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-800 border border-transparent focus:border-black outline-none"
                placeholder="Dropoff location"
              />

              <button
                onClick={handleSeePrices}
                className="inline-flex mt-1 items-center justify-center px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold"
              >
                See prices
              </button>
              <p className="text-[11px] text-gray-500 mt-1">
                Log in to see your recent activity and saved places.
              </p>
            </div>
          </div>

          {/* Right – Suggestions cards */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Suggestions</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {/* Ride card */}
              <div className="border rounded-2xl p-3 bg-gray-50 hover:bg-gray-100 transition flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold mb-1">Ride</p>
                  <p className="text-xs text-gray-600 mb-3">
                    Go anywhere with Taxi. Request a ride now or later.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSuggestion('ride')}
                  className="text-xs font-semibold underline"
                >
                  Details
                </button>
              </div>

              {/* Reserve card */}
              <div className="border rounded-2xl p-3 bg-gray-50 hover:bg-gray-100 transition flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold mb-1 text-red-600">
                    Reserve
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Book your Taxi in advance for important trips.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSuggestion('reserve')}
                  className="text-xs font-semibold underline"
                >
                  Details
                </button>
              </div>

              {/* Intercity card */}
              <div className="border rounded-2xl p-3 bg-gray-50 hover:bg-gray-100 transition flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold mb-1">Intercity</p>
                  <p className="text-xs text-gray-600 mb-3">
                    Comfortable intercity rides with upfront pricing.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSuggestion('intercity')}
                  className="text-xs font-semibold underline"
                >
                  Details
                </button>
              </div>
            </div>

            {/* Details panel – yahin par extra info dikhayenge */}
            <div className="mt-4 rounded-2xl border bg-white p-4 text-sm text-gray-700">
              {selectedSuggestion === 'ride' && (
                <>
                  <h4 className="font-semibold mb-1">Ride with Taxi</h4>
                  <p className="mb-2">
                    Quick on-demand rides for your daily commute, outings, and
                    last-minute plans.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Choose between Auto, Moto, and Car</li>
                    <li>Upfront fare estimates before you confirm</li>
                    <li>Live GPS tracking and trip sharing</li>
                  </ul>
                </>
              )}

              {selectedSuggestion === 'reserve' && (
                <>
                  <h4 className="font-semibold mb-1">Taxi Reserve</h4>
                  <p className="mb-2">
                    Schedule a ride in advance so your Taxi arrives exactly when
                    you need it.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Pick a date and time up to 7 days ahead</li>
                    <li>Extra wait time included for smoother pickup</li>
                    <li>Free cancellation up to 60 minutes in advance</li>
                  </ul>
                </>
              )}

              {selectedSuggestion === 'intercity' && (
                <>
                  <h4 className="font-semibold mb-1">Taxi Intercity</h4>
                  <p className="mb-2">
                    Comfortable out-of-city rides with transparent, upfront
                    pricing.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Perfect for weekend getaways and airport runs</li>
                    <li>Verified captains and well-maintained vehicles</li>
                    <li>No last-minute surprises in fare</li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-12 bg-gray-50 border-t border-b"
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            How Taxi works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-semibold mb-3">
                1
              </div>
              <h3 className="font-semibold mb-1">
                Set your pickup &amp; destination
              </h3>
              <p className="text-sm text-gray-600">
                Enter your pickup and drop locations in the Taxi app to see
                fare estimates instantly.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-semibold mb-3">
                2
              </div>
              <h3 className="font-semibold mb-1">Choose your ride</h3>
              <p className="text-sm text-gray-600">
                Select between Auto, Moto, or Car based on comfort and price.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-semibold mb-3">
                3
              </div>
              <h3 className="font-semibold mb-1">Track &amp; arrive safely</h3>
              <p className="text-sm text-gray-600">
                Track your captain live on the map and share trip details with
                friends or family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plan for later – Reserve style */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-[2fr,3fr] gap-8 items-stretch">
          <div className="bg-[#e5f2ff] rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-1">
                Get your ride right with Taxi Reserve
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Choose your exact pickup time up to 7 days in advance.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={reserveDate}
                    onChange={(e) => setReserveDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={reserveTime}
                    onChange={(e) => setReserveTime(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleReserve}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-black text-white text-sm font-semibold py-2.5"
            >
              Next
            </button>
          </div>

          {/* Benefits list */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Benefits</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 w-6 h-6 rounded-full border flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>
                  Choose your exact pickup time up to 7 days in advance.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-6 h-6 rounded-full border flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>Extra wait time included to meet your ride.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-6 h-6 rounded-full border flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>Cancel at no charge up to 60 minutes in advance.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Drive with Taxi */}
      <section id="drive" className="py-12 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Drive with Taxi
            </h2>
            <p className="text-gray-700 mb-4">
              Earn on your own schedule. With Taxi, captains get transparent
              fares, flexible hours, and a steady flow of ride requests.
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
              <li>Clear earnings, no hidden charges</li>
              <li>Live ride requests near your location</li>
              <li>24x7 captain support</li>
            </ul>
            <Link
              to="/captain-signup"
              className="inline-flex px-6 py-3 rounded-lg bg-black text-white font-semibold"
            >
              Start driving
            </Link>
          </div>
          <div className="flex justify-center">
            <img
              src="https://i.pinimg.com/736x/55/86/bc/5586bcc6bb651aca48029cc5d77e85fd.jpg"
              alt="Drive with Taxi"
              className="w-full max-w-md rounded-3xl shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* Taxi for Business / marketing cards */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-3xl overflow-hidden bg-white">
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">
                  The Taxi you know, reimagined for business
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Taxi for Business is a platform for managing company travel
                  and daily commute with easy controls and clear reports.
                </p>
                <button className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold">
                  Get started
                </button>
              </div>
              <img
                src="https://images.pexels.com/photos/3173564/pexels-photo-3173564.jpeg"
                alt="Business"
                className="w-full h-44 object-cover"
              />
            </div>

            <div className="border rounded-3xl overflow-hidden bg-white">
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">
                  Make money by driving with Taxi
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Join thousands of captains earning with Taxi across India.
                </p>
                <button className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold">
                  Get started
                </button>
              </div>
              <img
                src="https://images.pexels.com/photos/977213/pexels-photo-977213.jpeg"
                alt="Earn with car"
                className="w-full h-44 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Apps section */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-lg font-semibold mb-4">
            It&apos;s easier in the app
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-1">
                  Download the Taxi app
                </p>
                <p className="text-xs text-gray-600">
                  Book rides, track captains, and pay seamlessly.
                </p>
              </div>
              <button className="px-3 py-2 rounded-lg bg-black text-white text-xs font-semibold">
                Coming soon
              </button>
            </div>

            <div className="border rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-1">
                  Download the Taxi Captain app
                </p>
                <p className="text-xs text-gray-600">
                  Accept trips, navigate, and manage your earnings.
                </p>
              </div>
              <button className="px-3 py-2 rounded-lg bg-black text-white text-xs font-semibold">
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cities section */}
      <section id="cities" className="py-12 bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Taxi in your city
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Coming soon across major cities in India.
          </p>
          <div className="grid sm:grid-cols-4 gap-3 text-sm font-medium">
            <span className="border rounded-2xl px-4 py-2 bg-white">
              Delhi NCR
            </span>
            <span className="border rounded-2xl px-4 py-2 bg-white">
              Mumbai
            </span>
            <span className="border rounded-2xl px-4 py-2 bg-white">
              Bengaluru
            </span>
            <span className="border rounded-2xl px-4 py-2 bg-white">
              Hyderabad
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-black py-8 mt-0 text-gray-300">
        <div className="max-w-6xl mx-auto px-4 text-sm space-y-4">
          <div className="flex items-center gap-2">
            <img
              src="https://pngimg.com/d/taxi_logos_PNG2.png"
              alt="Taxi"
              className="w-6 h-6"
            />
            <span className="font-semibold">Taxi</span>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Taxi Technologies.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Start
