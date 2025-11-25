// src/App.jsx
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Start from './pages/Start'
import UserLogin from './pages/UserLogin'
import UserSignup from './pages/UserSignup'
import Captainlogin from './pages/Captainlogin'
import CaptainSignup from './pages/CaptainSignup'
import Home from './pages/Home'
import UserProtectWrapper from './pages/UserProtectWrapper'
import UserLogout from './pages/UserLogout'
import CaptainHome from './pages/CaptainHome'
import CaptainProtectWrapper from './pages/CaptainProtectWrapper'
import CaptainLogout from './pages/CaptainLogout'
import Riding from './pages/Riding'
import CaptainRiding from './pages/CaptainRiding'
import 'remixicon/fonts/remixicon.css'

import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import UserTrips from './pages/UserTrips'

import CaptainForgotPassword from './pages/CaptainForgotPassword'
import CaptainResetPassword from './pages/CaptainResetPassword'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Start />} />

        {/* User auth */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />

        {/* Rides */}
        <Route path="/riding" element={<Riding />} />
        <Route path="/captain-riding" element={<CaptainRiding />} />

        {/* User Forgot / Reset password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Captain auth */}
        <Route path="/captain-login" element={<Captainlogin />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />

        {/* Captain Forgot / Reset password */}
        <Route
          path="/captain-forgot-password"
          element={<CaptainForgotPassword />}
        />
        <Route
          path="/captain-reset-password/:token"
          element={<CaptainResetPassword />}
        />

        {/* Protected user routes */}
        <Route
          path="/home"
          element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          }
        />

        <Route
          path="/user/logout"
          element={
            <UserProtectWrapper>
              <UserLogout />
            </UserProtectWrapper>
          }
        />

        {/* Protected captain routes */}
        <Route
          path="/captain-home"
          element={
            <CaptainProtectWrapper>
              <CaptainHome />
            </CaptainProtectWrapper>
          }
        />

        <Route
          path="/captain/logout"
          element={
            <CaptainProtectWrapper>
              <CaptainLogout />
            </CaptainProtectWrapper>
          }
        />

        {/* Trips (user) */}
        <Route
          path="/trips"
          element={
            <UserProtectWrapper>
              <UserTrips />
            </UserProtectWrapper>
          }
        />
      </Routes>
    </div>
  )
}

export default App
