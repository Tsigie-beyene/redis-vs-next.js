import Link from 'next/link'
import { client } from '@/lib/db'

const getBooks = async () => {
  try {
    const keys = await client.keys('book:*')
    const books = []
    
    for (const key of keys) {
      const book = await client.hGetAll(key)
      if (book.title && book.author) {
        books.push({
          id: key.replace('book:', ''),
          ...book
        })
      }
    }
    
    return books
  } catch (error) {
    console.error('Error fetching books:', error)
    return []
  }
}

export default async function Home() {
  const books = await getBooks()

  return (
    <main className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className='text-4xl font-bold text-gray-900'>Books on Redis!</h1>
          <Link 
            href="/create" 
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors duration-200 font-medium"
          >
            Add a new book
          </Link>
        </div>
        
        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-xl mb-4">No books found</p>
            <p className="text-gray-500">Add your first book to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
            {books.map((book) => (
              <div 
                key={book.id} 
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-gray-600 mb-2 font-medium">
                  By: {book.author}
                </p>
                {book.rating && (
                  <div className="flex items-center mb-3">
                    <span className="text-sm text-gray-500 mr-2">Rating:</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">{book.rating}/10</span>
                      
                    </div>
                  </div>
                )}
                {book.blurb && (
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {book.blurb}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Stats */}
        {books.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Total books: {books.length}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
