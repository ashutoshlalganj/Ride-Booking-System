import React, { useContext } from 'react'
import { CaptainDataContext } from '../context/CapatainContext'

const CaptainDetails = ({
  todayTrips = 0,
  todayEarnings = 0,
  totalTrips = 0,
  totalEarnings = 0,
  onlineMinutes = 0,
}) => {
  const { captain } = useContext(CaptainDataContext)

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-3">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdlMd7stpWUCmjpfRjUsQ72xSWikidbgaI1w&s"
            alt="captain-avatar"
          />
          <h4 className="text-lg font-medium capitalize">
            {captain.fullname.firstname + ' ' + captain.fullname.lastname}
          </h4>
        </div>
        <div>
          <h4 className="text-xl font-semibold">₹{todayEarnings.toFixed(2)}</h4>
          <p className="text-sm text-gray-600">Earned today</p>
        </div>
      </div>

      <div className="flex p-3 mt-8 bg-gray-100 rounded-xl justify-center gap-5 items-start">
        <div className="text-center">
          <i className="text-3xl mb-2 font-thin ri-timer-2-line"></i>
          <h5 className="text-lg font-medium">{todayTrips}</h5>
          <p className="text-sm text-gray-600">Trips today</p>
        </div>
        <div className="text-center">
          <i className="text-3xl mb-2 font-thin ri-speed-up-line"></i>
          <h5 className="text-lg font-medium">{totalTrips}</h5>
          <p className="text-sm text-gray-600">Total trips</p>
        </div>
        <div className="text-center">
          <i className="text-3xl mb-2 font-thin ri-booklet-line"></i>
          <h5 className="text-lg font-medium">
            {onlineMinutes}
          </h5>
          <p className="text-sm text-gray-600">Online (min)</p>
        </div>
      </div>

      {/* optional: total earnings text */}
      <p className="mt-2 text-xs text-gray-500">
        Lifetime earnings: <span className="font-semibold">₹{totalEarnings.toFixed(2)}</span>
      </p>
    </div>
  )
}

export default CaptainDetails
