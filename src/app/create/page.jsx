'use client'

import { createBook } from '@/app/actions/create'
import { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Create() {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData) {
    setIsSubmitting(true)
    setError('')
    
    try {
      const result = await createBook(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        // If successful, redirect to home page
        router.push('/')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-blue-500 hover:text-blue-600 mb-4 inline-block">
          ← Back to Books
        </Link>
        <h2 className="text-3xl font-bold">Add a New Book</h2>
      </div>
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input 
            type="text" 
            id="title"
            name="title" 
            placeholder="Enter book title" 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
            Author *
          </label>
          <input 
            type="text" 
            id="author"
            name="author" 
            placeholder="Enter author name" 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
            Rating (1-10)
          </label>
          <input 
            type="number" 
            id="rating"
            name="rating" 
            max={10} 
            min={1} 
            placeholder="Enter rating" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="blurb" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea 
            id="blurb"
            name="blurb" 
            placeholder="Enter book description..." 
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding Book...' : 'Add Book'}
        </button>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </form>
    </main>
  )
}