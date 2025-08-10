'use server'

import { client } from "@/lib/db"

export async function createBook(formData) {
  const { title, author, rating, blurb } = Object.fromEntries(formData)

  // Validate required fields
  if (!title || !author) {
    return { error: 'Title and author are required' }
  }

  try {
    const id = crypto.randomUUID()

    // const unique=await client.zAdd('books', {
    //   value: title,
    //   score: id
    // },{NX:true})

    await client.hSet(`book:${id}`, {
      title, 
      author,
      rating, 
      blurb
    })

    // Return success indicator
    return { success: true, id }
  } catch (error) {
    console.error('Error creating book:', error)
    return { error: 'Failed to create book. Please try again.' }
  }
}