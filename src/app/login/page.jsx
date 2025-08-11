'use client'

import { loginUser } from '@/app/actions/auth'
import { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData) {
    setIsSubmitting(true)
    setError('')
    
    try {
      const result = await loginUser(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        // Redirect to dashboard on successful login
        router.push('/')
        router.refresh() // Refresh to update authentication state
      }
    } catch (error) {
      console.error('Login submission error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔐 Secure Login</h1>
            <p className="text-gray-600">Redis-powered authentication with encryption</p>
          </div>
          
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input 
                type="text" 
                id="username"
                name="username" 
                placeholder="Enter your username" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input 
                type="password" 
                id="password"
                name="password" 
                placeholder="Enter your password" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          {error && (
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Create one here
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">🔒 Security Features</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Credentials encrypted in Redis</li>
              <li>• No data stored in browser</li>
              <li>• Secure HTTP-only cookies</li>
              <li>• Session-based authentication</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
