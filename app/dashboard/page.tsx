export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import CV from '@/models/CV'
import CoverLetter from '@/models/CoverLetter'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  await connectToDatabase()

  const [cvs, letters] = await Promise.all([
    CV.find({ userId: session.user.id }).sort({ uploadedAt: -1 }).lean(),
    CoverLetter.find({ userId: session.user.id })
      .populate('cvId', 'filename')
      .sort({ createdAt: -1 })
      .lean(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
          CoverLetterAI
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hello, {session.user.name}</span>
          <Link
            href="/api/auth/signout"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-3">
            <Link
              href="/cv/upload"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Upload CV
            </Link>
            <Link
              href="/generate"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Generate Letter
            </Link>
          </div>
        </div>

        {/* CVs Section */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Your CVs ({cvs.length})
          </h2>
          {cvs.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500 text-sm mb-3">No CVs uploaded yet.</p>
              <Link
                href="/cv/upload"
                className="text-indigo-600 font-medium text-sm hover:underline"
              >
                Upload your first CV
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cvs.map((cv: any) => (
                <div key={cv._id.toString()} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📄</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{cv.filename}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(cv.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cover Letters Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Generated Letters ({letters.length})
          </h2>
          {letters.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500 text-sm mb-3">No letters generated yet.</p>
              {cvs.length > 0 ? (
                <Link
                  href="/generate"
                  className="text-indigo-600 font-medium text-sm hover:underline"
                >
                  Generate your first cover letter
                </Link>
              ) : (
                <p className="text-gray-400 text-xs">Upload a CV first to get started.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {letters.map((letter: any) => (
                <div key={letter._id.toString()} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {letter.jobDescription.slice(0, 80)}...
                    </p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(letter.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-indigo-500 capitalize">{letter.parameters.tone}</span>
                      <span className="text-xs text-gray-400">{(letter.cvId as any)?.filename}</span>
                    </div>
                  </div>
                  <Link
                    href={`/letters/${letter._id.toString()}`}
                    className="text-sm text-indigo-600 hover:underline font-medium ml-4 shrink-0"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
