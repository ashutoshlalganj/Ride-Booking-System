import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()

  // In pages par navbar hide rahega
  const isAuthPage =
    ['/login', '/signup', '/captain-login', '/captain-signup'].includes(
      location.pathname
    )

  if (isAuthPage) return null

  return (
    <nav className="w-full fixed top-0 left-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Brand */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://pngimg.com/d/taxi_logos_PNG2.png"
            alt="Taxi"
            className="w-9 h-9"
          />
          <span className="text-xl font-semibold tracking-tight">Taxi</span>
        </Link>

        {/* Desktop menu links – Start.jsx ke sections ke according */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#ride" className="hover:text-black text-gray-700">
            Ride
          </a>
          <a href="#drive" className="hover:text-black text-gray-700">
            Drive
          </a>
          <a href="#how-it-works" className="hover:text-black text-gray-700">
            How it works
          </a>
          <a href="#cities" className="hover:text-black text-gray-700">
            Cities
          </a>

          {/* Trips page link */}
          <Link to="/trips" className="hover:text-black text-gray-700">
            Your trips
          </Link>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          {/* 👇 yahan se 'hidden sm:inline-flex' hata diya */}
          <Link
            to="/login"
            className="inline-flex px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-100"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-900"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Mobile menu bar (Ride / Drive / How it works / Cities / Your trips) */}
      <div className="md:hidden border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-4 text-xs font-medium overflow-x-auto whitespace-nowrap">
          <a href="#ride" className="text-gray-700 hover:text-black">
            Ride
          </a>
          <a href="#drive" className="text-gray-700 hover:text-black">
            Drive
          </a>
          <a href="#how-it-works" className="text-gray-700 hover:text-black">
            How it works
          </a>
          <a href="#cities" className="text-gray-700 hover:text-black">
            Cities
          </a>
          <Link to="/trips" className="text-gray-700 hover:text-black">
            Your trips
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
