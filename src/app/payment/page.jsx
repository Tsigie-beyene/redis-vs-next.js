'use client'

import { initializePayment, processPayment } from '@/app/actions/payment'
import { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Payment() {
  const [step, setStep] = useState(1) // 1: Amount, 2: Card Details
  const [sessionId, setSessionId] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const router = useRouter()

  async function handleAmountSubmit(formData) {
    setIsSubmitting(true)
    setError('')
    
    try {
      const result = await initializePayment(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSessionId(result.sessionId)
        setPaymentData({
          amount: formData.get('amount'),
          currency: formData.get('currency'),
          description: formData.get('description')
        })
        setStep(2)
      }
    } catch (error) {
      console.error('Amount submission error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCardSubmit(formData) {
    setIsSubmitting(true)
    setError('')
    
    try {
      // Add sessionId to form data
      formData.append('sessionId', sessionId)
      
      const result = await processPayment(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        // Redirect to status page with session ID
        router.push(`/status?sessionId=${sessionId}`)
      }
    } catch (error) {
      console.error('Card submission error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">💳 Secure Payment Processing</h1>
          <p className="text-gray-600 mt-2">
            {step === 1 ? 'Step 1: Enter payment details' : 'Step 2: Enter card information'}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Authenticated user session active
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Amount Form */}
        {step === 1 && (
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
            
            <form action={handleAmountSubmit} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input 
                  type="number" 
                  id="amount"
                  name="amount" 
                  step="0.01"
                  min="0.01"
                  placeholder="0.00" 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select 
                  id="currency"
                  name="currency" 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select currency</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input 
                  type="text" 
                  id="description"
                  name="description" 
                  placeholder="Payment description..." 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Card Details Form */}
        {step === 2 && (
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Card Information</h2>
            
            {/* Payment Summary */}
            {paymentData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Payment Summary</h3>
                <p className="text-blue-800">
                  Amount: {paymentData.amount} {paymentData.currency}
                  {paymentData.description && ` - ${paymentData.description}`}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Session ID: {sessionId.slice(0, 8)}...
                </p>
              </div>
            )}
            
            <form action={handleCardSubmit} className="space-y-6">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number *
                </label>
                <input 
                  type="text" 
                  id="cardNumber"
                  name="cardNumber" 
                  placeholder="1234 5678 9012 3456" 
                  required 
                  maxLength="19"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Month *
                  </label>
                  <select 
                    id="expiryMonth"
                    name="expiryMonth" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">MM</option>
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Year *
                  </label>
                  <select 
                    id="expiryYear"
                    name="expiryYear" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">YYYY</option>
                    {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input 
                    type="text" 
                    id="cvv"
                    name="cvv" 
                    placeholder="123" 
                    required 
                    maxLength="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name *
                  </label>
                  <input 
                    type="text" 
                    id="cardholderName"
                    name="cardholderName" 
                    placeholder="John Doe" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 font-semibold"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  {isSubmitting ? 'Processing Payment...' : 'Process Payment'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">🔒 Security Notice</h3>
          <p className="text-sm text-green-800">
            All sensitive payment data is encrypted and stored securely in Redis. 
            No card information is stored in your browser or visible in URLs.
          </p>
        </div>
      </div>
    </main>
  )
}
