
import React from 'react'
import { Link } from 'react-router-dom'

const Start = () => {
  return (
    <div>
      <div className='bg-cover bg-center bg-[url(https://images.pexels.com/photos/2422270/pexels-photo-2422270.jpeg?cs=srgb&dl=pexels-josh-hild-1270765-2422270.jpg&fm=jpg)] h-screen pt-8 flex justify-between flex-col w-full'>
        <img className='w-16 ml-8' src="https://pngimg.com/d/taxi_logos_PNG2.png" alt="" />
        <div className='bg-white pb-8 py-4 px-4'>
          <h2 className='text-[30px] font-semibold'>Get Started with Taxi</h2>
          <Link to='/login' className='flex items-center justify-center w-full bg-black text-white py-3 rounded-lg mt-5'>Continue</Link>
        </div>
      </div>
    </div>
  )
}

export default Start