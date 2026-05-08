import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import CV from '@/models/CV'
import CoverLetter from '@/models/CoverLetter'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

const lengthInstructions = {
  short: 'Write a concise cover letter of approximately 200-250 words (3 short paragraphs).',
  medium: 'Write a standard cover letter of approximately 350-400 words (4 paragraphs).',
  long: 'Write a detailed cover letter of approximately 500-600 words (5 paragraphs).',
}

const toneInstructions = {
  formal: 'Use a formal, professional tone with precise and structured language.',
  friendly: 'Use a warm, approachable tone that is professional yet personable.',
  enthusiastic: 'Use an energetic, enthusiastic tone that conveys genuine excitement about the role.',
}

const emphasisInstructions = {
  skills: "Focus primarily on the candidate's technical skills and competencies that match the job requirements.",
  experience: "Focus primarily on the candidate's work experience, achievements, and career progression.",
  motivation: "Focus primarily on the candidate's motivation for the role, cultural fit, and passion for the industry.",
}

function buildPrompt(
  cvText: string,
  jobDescription: string,
  tone: string,
  length: string,
  language: string,
  emphasis: string
): string {
  return `You are an expert career coach and professional cover letter writer. Your task is to write a tailored cover letter for the candidate described in their CV.

INSTRUCTIONS:
- ${lengthInstructions[length as keyof typeof lengthInstructions]}
- ${toneInstructions[tone as keyof typeof toneInstructions]}
- ${emphasisInstructions[emphasis as keyof typeof emphasisInstructions]}
- Write the letter in ${language}.
- The letter must be specific to both the candidate's background and the job description — do not write a generic letter.
- Include a proper salutation (use "Dear Hiring Manager," if no specific name is available), body paragraphs, and a closing.
- Do NOT include a subject line or header. Start directly with the salutation.
- Do NOT add placeholder brackets like [Company Name] — infer what you can from the job description, or use general phrasing.
- Do NOT include the date or addresses.
- Output ONLY the cover letter text, nothing else.

CANDIDATE CV:
${cvText.slice(0, 4000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { cvId, jobDescription, tone, length, language, emphasis } = body

    if (!cvId) return NextResponse.json({ error: 'CV is required' }, { status: 400 })
    if (!jobDescription?.trim()) return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    if (jobDescription.trim().length < 50) return NextResponse.json({ error: 'Job description is too short' }, { status: 400 })
    if (!['formal', 'friendly', 'enthusiastic'].includes(tone)) return NextResponse.json({ error: 'Invalid tone' }, { status: 400 })
    if (!['short', 'medium', 'long'].includes(length)) return NextResponse.json({ error: 'Invalid length' }, { status: 400 })
    if (!['English', 'Romanian'].includes(language)) return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
    if (!['skills', 'experience', 'motivation'].includes(emphasis)) return NextResponse.json({ error: 'Invalid emphasis' }, { status: 400 })

    await connectToDatabase()

    const cv = await CV.findOne({ _id: cvId, userId: session.user.id })
    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 })
    }

    const prompt = buildPrompt(cv.extractedText, jobDescription, tone, length, language, emphasis)

    // Call Gemini via Google AI Studio API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const generatedText = result.response.text().trim()

    if (!generatedText) {
      return NextResponse.json({ error: 'AI did not return a result. Please try again.' }, { status: 500 })
    }

    const letter = await CoverLetter.create({
      userId: session.user.id,
      cvId,
      jobDescription,
      parameters: { tone, length, language, emphasis },
      generatedText,
    })

    return NextResponse.json({ letterId: letter._id.toString(), generatedText }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/generate error:', error)
    if (error?.status === 400 && error?.message?.includes('API_KEY')) {
      return NextResponse.json({ error: 'Google AI API key is invalid or missing' }, { status: 502 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
