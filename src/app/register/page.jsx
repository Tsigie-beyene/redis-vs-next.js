'use client'

import { registerUser } from '@/app/actions/auth'
import { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData) {
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await registerUser(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess('Account created successfully! You can now sign in.')
        // Clear form by resetting
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error) {
      console.error('Registration submission error:', error)
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Create Account</h1>
            <p className="text-gray-600">Secure user registration with Redis encryption</p>
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
                placeholder="Choose a username" 
                required 
                minLength={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input 
                type="email" 
                id="email"
                name="email" 
                placeholder="your.email@example.com" 
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
                placeholder="Create a password (min 6 characters)" 
                required 
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          {error && (
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">🔒 Account Security</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Passwords hashed with SHA-256</li>
              <li>• User data encrypted in Redis</li>
              <li>• No sensitive data in browser</li>
              <li>• Secure session management</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
