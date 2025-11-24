import React, { useState, useEffect } from 'react'
import {
  LoadScript,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100%',
}

// Default center – agar kuch na mile to
const defaultCenter = {
  lat: 28.6139, // New Delhi
  lng: 77.209,
}

/**
 * LiveTracking
 * props:
 *  - pickup: string (address)
 *  - destination: string (address)
 *
 * - Agar pickup + destination set honge → Google Directions se ROUTE draw karega
 * - Agar nahi honge → sirf current location marker
 */
const LiveTracking = ({ pickup, destination }) => {
  const [currentPosition, setCurrentPosition] = useState(defaultCenter)
  const [directions, setDirections] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // 🔹 Current GPS
  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentPosition({
          lat: latitude,
          lng: longitude,
        })
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentPosition({
          lat: latitude,
          lng: longitude,
        })
      },
      () => {},
      { enableHighAccuracy: true }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  // 🔹 Route banana jab pickup + destination aaye
  useEffect(() => {
    if (!mapLoaded) return
    if (!pickup || !destination) {
      setDirections(null)
      return
    }
    if (!window.google || !window.google.maps) return

    const directionsService = new window.google.maps.DirectionsService()

    directionsService.route(
      {
        origin: pickup,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result)

          // Map ko route ke beech me center karo
          const route = result.routes[0]
          if (route && route.overview_path && route.overview_path.length) {
            const mid =
              route.overview_path[Math.floor(route.overview_path.length / 2)]
            setCurrentPosition({
              lat: mid.lat(),
              lng: mid.lng(),
            })
          }
        } else {
          console.error('Directions request failed:', status)
          setDirections(null)
        }
      }
    )
  }, [pickup, destination, mapLoaded])

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={['places']}
      onLoad={() => setMapLoaded(true)}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={13}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {/* Agar directions hai → route + markers */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: false,
              suppressInfoWindows: false,
            }}
          />
        )}

        {/* Agar route nahi → sirf current location marker */}
        {!directions && <Marker position={currentPosition} />}
      </GoogleMap>
    </LoadScript>
  )
}

export default LiveTracking
