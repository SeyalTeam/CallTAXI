import React from 'react'

export const Logo: React.FC<any> = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-5xl font-extrabold tracking-tight">Kani Taxi</h1>
      <span className="text-sm font-semibold text-gray-500 mt-2">Powered by VSeyal</span>
    </div>
  )
}
