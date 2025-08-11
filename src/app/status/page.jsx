'use client'

import { getPaymentStatus, clearSession } from '@/app/actions/payment'
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Status() {
  const [paymentData, setPaymentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clearing, setClearing] = useState(false)
  const [availableSessions, setAvailableSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus()
    } else {
      // If no session ID, load available sessions
      loadAvailableSessions()
    }
  }, [sessionId])

  async function loadAvailableSessions() {
    setLoadingSessions(true)
    try {
      // This would typically call an API to get available sessions
      // For demo purposes, we'll show a message and redirect option
      setLoading(false)
    } catch (error) {
      console.error('Error loading sessions:', error)
      setError('Failed to load available sessions')
      setLoading(false)
    } finally {
      setLoadingSessions(false)
    }
  }

  async function checkPaymentStatus() {
    try {
      const result = await getPaymentStatus(sessionId)
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setPaymentData(result)
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      setError('Failed to retrieve payment status')
    } finally {
      setLoading(false)
    }
  }

  async function handleClearSession() {
    setClearing(true)
    try {
      const result = await clearSession(sessionId)
      if (result?.success) {
        router.push('/')
      } else {
        setError('Failed to clear session')
      }
    } catch (error) {
      console.error('Error clearing session:', error)
      setError('Failed to clear session')
    } finally {
      setClearing(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Retrieving payment status from Redis...</p>
          </div>
        </div>
      </main>
    )
  }

  // Show session selection when no sessionId is provided
  if (!sessionId) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">📊 Payment Status</h1>
            <p className="text-gray-600 mt-2">Select a payment session to check status</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
            <div className="text-center">
              <div className="text-blue-500 text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Session Selected</h2>
              <p className="text-gray-600 mb-6">
                To check payment status, you need to either:
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Option 1: Start a New Payment</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Create a new payment session and then check its status
                  </p>
                  <Link 
                    href="/payment" 
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Start New Payment
                  </Link>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Option 2: Check Dashboard</h3>
                  <p className="text-green-700 text-sm mb-3">
                    View active sessions on the dashboard
                  </p>
                  <Link 
                    href="/" 
                    className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">💡 How It Works</h3>
                <p className="text-yellow-800 text-sm">
                  <strong>Step 1:</strong> Start a payment from the dashboard<br/>
                  <strong>Step 2:</strong> Complete the payment process<br/>
                  <strong>Step 3:</strong> You'll be automatically redirected to the status page<br/>
                  <strong>Step 4:</strong> Or manually check status using the session ID
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Status Error</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <Link 
                  href="/" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Back to Dashboard
                </Link>
                <br/>
                <Link 
                  href="/payment" 
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Start New Payment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">📊 Payment Status</h1>
          <p className="text-gray-600 mt-2">Retrieved from Redis cache</p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
          {/* Status Header */}
          <div className="text-center mb-8">
            {paymentData?.result?.success ? (
              <div className="text-green-500 text-6xl mb-4">✅</div>
            ) : (
              <div className="text-red-500 text-6xl mb-4">❌</div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {paymentData?.result?.success ? 'Payment Successful' : 'Payment Failed'}
            </h2>
            <p className="text-gray-600">
              {paymentData?.result?.message || 'Payment processing completed'}
            </p>
          </div>

          {/* Payment Details */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <p className="font-medium">{paymentData?.amount} {paymentData?.currency}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    paymentData?.status === 'completed' ? 'bg-green-100 text-green-800' :
                    paymentData?.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {paymentData?.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Description:</span>
                  <p className="font-medium">{paymentData?.description || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Timestamp:</span>
                  <p className="font-medium">{new Date(paymentData?.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            {paymentData?.result && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Transaction ID:</span>
                    <p className="font-mono text-blue-800">{paymentData.result.transactionId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Processing Time:</span>
                    <p className="font-medium">{new Date(paymentData.result.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Result:</span>
                    <p className="font-medium">{paymentData.result.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Redis Session Info */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🔐 Redis Session Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Session ID:</span>
                  <p className="font-mono text-purple-800">{sessionId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Data Source:</span>
                  <p className="font-medium">Encrypted Redis Cache</p>
                </div>
                <div>
                  <span className="text-gray-600">Security:</span>
                  <p className="font-medium">AES-256 Encrypted Session Data</p>
                </div>
                <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-200">
                  <p className="text-yellow-800 text-xs">
                    <strong>Security Note:</strong> No sensitive card information is stored in browser or visible in URLs. 
                    All payment data is encrypted and cached securely in Redis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleClearSession}
              disabled={clearing}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {clearing ? 'Clearing...' : 'Clear Session'}
            </button>
            <Link
              href="/payment"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold text-center"
            >
              New Payment
            </Link>
          </div>
        </div>

        {/* Demo Information */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-3">🎯 Demo Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Security Features:</h4>
              <ul className="space-y-1 text-green-700">
                <li>• AES-256 encryption for all sensitive data</li>
                <li>• No local storage usage</li>
                <li>• Server-side session management</li>
                <li>• Automatic session expiry</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Redis Caching:</h4>
              <ul className="space-y-1 text-green-700">
                <li>• Encrypted session storage</li>
                <li>• Payment data caching</li>
                <li>• Fast data retrieval</li>
                <li>• Secure data persistence</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
