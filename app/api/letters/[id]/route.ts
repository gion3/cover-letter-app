import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import CoverLetter from '@/models/CoverLetter'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const letter = await CoverLetter.findOne({
      _id: params.id,
      userId: session.user.id,
    })
      .populate('cvId', 'filename')
      .lean()

    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 })
    }

    return NextResponse.json({ letter })
  } catch (error) {
    console.error('GET /api/letters/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const result = await CoverLetter.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    })

    if (!result) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Letter deleted' })
  } catch (error) {
    console.error('DELETE /api/letters/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
