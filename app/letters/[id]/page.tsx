export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import CoverLetter from '@/models/CoverLetter'
import CV from '@/models/CV'
import Link from 'next/link'
import CopyButton from './CopyButton'
import DeleteButton from './DeleteButton'

export default async function LetterPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  await connectToDatabase()

  const letter = await CoverLetter.findOne({
    _id: params.id,
    userId: session.user.id,
  }).lean()

  if (!letter) notFound()

  const cv = await CV.findById((letter as any).cvId).lean()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
          CoverLetterAI
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Cover Letter</h1>
            <p className="text-sm text-gray-400">
              Generated on {new Date((letter as any).createdAt).toLocaleDateString()} ·{' '}
              {(cv as any)?.filename || 'Unknown CV'} ·{' '}
              <span className="capitalize">{(letter as any).parameters.tone}</span> tone ·{' '}
              <span className="capitalize">{(letter as any).parameters.length}</span> length ·{' '}
              {(letter as any).parameters.language}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <CopyButton text={(letter as any).generatedText} />
            <DeleteButton letterId={params.id} />
          </div>
        </div>

        {/* Job Description (collapsed) */}
        <details className="mb-6 bg-white rounded-xl border border-gray-200">
          <summary className="px-5 py-3 text-sm font-medium text-gray-700 cursor-pointer select-none">
            View Job Description
          </summary>
          <div className="px-5 pb-4">
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{(letter as any).jobDescription}</p>
          </div>
        </details>

        {/* Generated Letter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Generated Letter
          </h2>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
              {(letter as any).generatedText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
