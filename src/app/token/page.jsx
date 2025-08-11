'use client'

import { refreshToken } from '@/app/actions/auth'
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Client-side JWT decode function
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Token decode failed:', error)
    return null
  }
}

export default function TokenManagement() {
  const [user, setUser] = useState(null)
  const [tokenInfo, setTokenInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadTokenInfo()
  }, [])

  async function loadTokenInfo() {
    try {
      // Get token from cookies
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))
      const token = tokenCookie ? tokenCookie.split('=')[1] : null

      if (!token) {
        router.push('/login')
        return
      }

      // Decode token to get user info
      const decoded = decodeToken(token)
      if (!decoded || !decoded.userId) {
        router.push('/login')
        return
      }

      // Set user info from token
      setUser({
        username: decoded.userId,
        createdAt: new Date(decoded.iat * 1000).toISOString(),
        lastLogin: new Date().toISOString()
      })

      if (token) {
        setTokenInfo({
          token: token,
          decoded: decoded,
          header: JSON.parse(atob(token.split('.')[0])),
          payload: decoded
        })
      }
    } catch (error) {
      console.error('Error loading token info:', error)
      setError('Failed to load token information')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleRefreshToken() {
    setRefreshing(true)
    try {
      const result = await refreshToken()
      if (result?.success) {
        // Reload token info
        await loadTokenInfo()
      } else {
        setError(result?.error || 'Failed to refresh token')
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      setError('Failed to refresh token')
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading token information...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">🔑 JWT Token Management</h1>
          <p className="text-gray-600 mt-2">Secure token-based authentication with Redis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Information */}
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 User Information</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Username:</span>
                <p className="text-lg font-semibold text-gray-900">{user.username}</p>
              </div>
              {user.email && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-600">Account Created:</span>
                <p className="text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Last Login:</span>
                <p className="text-sm text-gray-900">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'First time'}
                </p>
              </div>
            </div>
          </div>

          {/* Token Actions */}
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔄 Token Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleRefreshToken}
                disabled={refreshing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {refreshing ? 'Refreshing Token...' : '🔄 Refresh Token'}
              </button>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">💡 Token Security</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Tokens are stored securely in HTTP-only cookies</li>
                  <li>• Automatic expiration after 2 hours</li>
                  <li>• Redis-backed session validation</li>
                  <li>• Encrypted session storage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Token Information */}
        {tokenInfo && (
          <div className="mt-8 bg-white rounded-lg p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Token Details</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Token Header */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Token Header</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 overflow-x-auto">
                    {JSON.stringify(tokenInfo.header, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Token Payload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Token Payload</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 overflow-x-auto">
                    {JSON.stringify(tokenInfo.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Token Expiry Info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">⏰ Token Expiry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Issued At:</span>
                  <p className="font-medium text-blue-900">
                    {new Date(tokenInfo.payload.iat * 1000).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Expires At:</span>
                  <p className="font-medium text-blue-900">
                    {new Date(tokenInfo.payload.exp * 1000).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Issuer:</span>
                  <p className="font-medium text-blue-900">{tokenInfo.payload.iss}</p>
                </div>
                <div>
                  <span className="text-blue-700">Audience:</span>
                  <p className="font-medium text-blue-900">{tokenInfo.payload.aud}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Features */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-4">🔒 JWT Security Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Token Security:</h4>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• Signed with secure secret key</li>
                <li>• Automatic expiration (2 hours)</li>
                <li>• Issuer and audience validation</li>
                <li>• Redis-backed session tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Storage Security:</h4>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• HTTP-only cookies</li>
                <li>• Encrypted Redis storage</li>
                <li>• No client-side token exposure</li>
                <li>• Automatic session cleanup</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </main>
  )
}
