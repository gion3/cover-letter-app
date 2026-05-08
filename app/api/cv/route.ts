import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import CV from '@/models/CV'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const cvs = await CV.find({ userId: session.user.id }).sort({ uploadedAt: -1 }).lean()

    return NextResponse.json({ cvs })
  } catch (error) {
    console.error('GET /api/cv error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be smaller than 5MB' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Dynamically import pdf-parse to avoid edge runtime issues
    const pdfParse = (await import('pdf-parse')).default
    const parsed = await pdfParse(buffer)
    const extractedText = parsed.text?.trim()

    if (!extractedText) {
      return NextResponse.json({ error: 'Could not extract text from PDF. Ensure the PDF contains selectable text.' }, { status: 422 })
    }

    await connectToDatabase()

    const cv = await CV.create({
      userId: session.user.id,
      filename: file.name,
      extractedText,
    })

    return NextResponse.json({ message: 'CV uploaded successfully', cvId: cv._id }, { status: 201 })
  } catch (error) {
    console.error('POST /api/cv error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
