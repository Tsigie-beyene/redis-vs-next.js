import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { redisClient } from '@/lib/db'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'

const getActiveSessions = async () => {
  try {
    const keys = await redisClient.keys('session:*')
    return keys.map(key => key.replace('session:', ''))
  } catch (error) {
    console.error('Error fetching active sessions:', error)
    return []
  }
}

const getRedisStats = async () => {
  try {
    const sessionKeys = await redisClient.keys('session:*')
    const paymentKeys = await redisClient.keys('payment:*')
    const userKeys = await redisClient.keys('user:*')
    const tokenKeys = await redisClient.keys('token:*')
    
    return {
      activeSessions: sessionKeys.length,
      cachedPayments: paymentKeys.length,
      registeredUsers: userKeys.length,
      tokenSessions: tokenKeys.length,
      totalKeys: sessionKeys.length + paymentKeys.length + userKeys.length + tokenKeys.length
    }
  } catch (error) {
    console.error('Error fetching Redis stats:', error)
    return { activeSessions: 0, cachedPayments: 0, registeredUsers: 0, tokenSessions: 0, totalKeys: 0 }
  }
}

export default async function Home() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const stats = await getRedisStats()
  const sessions = await getActiveSessions()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              🔐 Redis Payment Gateway Demo
            </h1>
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold text-blue-600">{user.username}</span>!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Last login</p>
              <p className="text-sm font-medium text-gray-900">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'First time'}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cached Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cachedPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Token Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tokenSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8 1.79 8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Redis Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalKeys}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mb-12">
          <Link 
            href="/payment" 
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold text-lg shadow-lg"
          >
            💳 Start New Payment
          </Link>
          {sessions.length > 0 && (
            <Link 
              href="/status" 
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold text-lg shadow-lg"
            >
              📊 Check Payment Status
            </Link>
          )}
          <Link 
            href="/token" 
            className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-semibold text-lg shadow-lg"
          >
            🔑 Token Management
          </Link>
        </div>

        {/* Guidance when no sessions */}
        {sessions.length === 0 && (
          <div className="text-center mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Getting Started</h3>
              <p className="text-blue-700 text-sm">
                To see payment status checking in action, start a new payment first. 
                After completing a payment, you'll be able to check its status and see Redis caching at work.
              </p>
            </div>
          </div>
        )}

        {/* Security Features */}
        <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔒 Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">AES-256 Encryption</h3>
                  <p className="text-sm text-gray-500">All sensitive data encrypted before Redis storage</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">No Local Storage</h3>
                  <p className="text-sm text-gray-500">Zero sensitive data stored in browser</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Session Management</h3>
                  <p className="text-sm text-gray-500">Secure server-side session handling</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Auto Expiry</h3>
                  <p className="text-sm text-gray-500">Automatic cleanup of expired sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Active Sessions */}
        {sessions.length > 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Active Payment Sessions</h2>
            <div className="grid gap-4">
              {sessions.map((sessionId) => (
                <div 
                  key={sessionId} 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">Session ID: {sessionId.slice(0, 8)}...</p>
                      <p className="font-medium text-gray-900">Active Payment Session</p>
                      <p className="text-sm text-gray-600">Session data stored in Redis</p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        active
                      </span>
                    </div>
                    <div className="text-right">
                      <Link 
                        href={`/status?sessionId=${sessionId}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">💳</div>
            <p className="text-gray-600 text-xl mb-4">No active payment sessions</p>
            <p className="text-gray-500">Start a new payment to see Redis caching in action!</p>
          </div>
        )}
      </div>
    </main>
  )
}
