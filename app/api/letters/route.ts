import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import CoverLetter from '@/models/CoverLetter'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const letters = await CoverLetter.find({ userId: session.user.id })
      .populate('cvId', 'filename')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ letters })
  } catch (error) {
    console.error('GET /api/letters error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
