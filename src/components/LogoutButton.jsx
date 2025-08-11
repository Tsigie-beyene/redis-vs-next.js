'use client'

import { logoutUser } from '@/app/actions/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      const result = await logoutUser()
      if (result?.success) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors duration-200"
    >
      {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
    </button>
  )
}

