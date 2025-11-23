import React from 'react'
import { Link } from 'react-router-dom'

const Start = () => {
  return (
    <div
      className="h-screen w-full
                 bg-[url('https://images.pexels.com/photos/2422270/pexels-photo-2422270.jpeg?cs=srgb&dl=pexels-josh-hild-1270765-2422270.jpg&fm=jpg')]
                 bg-cover bg-center
                 flex flex-col"
    >
      {/* Top logo */}
      <div className="pt-6 px-6">
        <img
          className="w-16"
          src="https://pngimg.com/d/taxi_logos_PNG2.png"
          alt="Taxi Logo"
        />
      </div>

      {/* Spacer (ye image area ko stretch karega, scroll nahi aayega) */}
      <div className="flex-1" />

      {/* Bottom white band – full width, centred content */}
      <div className="w-full bg-white py-6 px-4 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center">
          Get Started with Taxi
        </h2>

        <Link
          to="/login"
          className="mt-5 w-full max-w-sm
                     bg-black text-white py-3 rounded-lg
                     flex items-center justify-center
                     text-base sm:text-lg"
        >
          Continue
        </Link>
      </div>
    </div>
  )
}

export default Start
