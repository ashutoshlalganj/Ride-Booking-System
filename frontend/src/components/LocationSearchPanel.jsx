// src/components/LocationSearchPanel.jsx

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import 'remixicon/fonts/remixicon.css'

/**
 * props:
 *  - suggestions: string[] (Google autocomplete results from parent)
 *  - setPanelOpen
 *  - setPickup, setDestination
 *  - activeField: 'pickup' | 'destination'
 */
const LocationSearchPanel = ({
  suggestions = [],
  setPanelOpen,
  setPickup,
  setDestination,
  activeField,
}) => {
  const [savedPlaces, setSavedPlaces] = useState([])
  const [loadingSaved, setLoadingSaved] = useState(false)

  // 🔹 Backend se saved places laao
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoadingSaved(true)
        const token = localStorage.getItem('token')
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/saved-places`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setSavedPlaces(res.data || [])
      } catch (err) {
        console.error('Error loading saved places', err)
      } finally {
        setLoadingSaved(false)
      }
    }

    fetchSaved()
  }, [])

  const handleSelectAddress = (address) => {
    if (activeField === 'pickup') {
      setPickup(address)
    } else {
      setDestination(address)
    }
    setPanelOpen(false)
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header drag handle */}
      <div className="pt-3 pb-2 flex justify-center">
        <div className="w-10 h-1 rounded-full bg-gray-300" />
      </div>

      <div className="px-4 pb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">Choose location</h3>
        <button
          onClick={() => setPanelOpen(false)}
          className="text-gray-500 text-xl"
        >
          <i className="ri-close-line" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
        {/* Saved places */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Saved places
            </h4>
            {loadingSaved && (
              <span className="text-[10px] text-gray-400">Loading...</span>
            )}
          </div>

          {savedPlaces && savedPlaces.length > 0 ? (
            <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
              {savedPlaces.map((place, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectAddress(place.address)}
                  className="w-full flex items-start gap-3 px-3 py-3 hover:bg-gray-100 border-b last:border-b-0 border-gray-100 text-left"
                >
                  <div className="mt-1">
                    <i className="ri-bookmark-3-fill text-sm text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {place.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {place.address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 px-2">
              You don&apos;t have any saved places yet.
            </p>
          )}
        </div>

        {/* Live suggestions from Google autocomplete */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 px-2 mb-2">
            Search results
          </h4>

          {suggestions && suggestions.length > 0 ? (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectAddress(item)}
                  className="w-full flex items-start gap-3 px-3 py-3 hover:bg-gray-50 border-b last:border-b-0 border-gray-100 text-left"
                >
                  <div className="mt-1">
                    <i className="ri-map-pin-2-fill text-base text-black" />
                  </div>
                  <p className="text-sm text-gray-800">{item}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 px-2">
              Start typing to see suggestions.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationSearchPanel
