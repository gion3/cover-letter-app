'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CV {
  _id: string
  filename: string
  uploadedAt: string
}

export default function GeneratePage() {
  const router = useRouter()
  const [cvs, setCvs] = useState<CV[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCvs, setLoadingCvs] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    cvId: '',
    jobDescription: '',
    tone: 'formal',
    length: 'medium',
    language: 'English',
    emphasis: 'skills',
  })

  useEffect(() => {
    fetch('/api/cv')
      .then((r) => r.json())
      .then((data) => {
        setCvs(data.cvs || [])
        if (data.cvs?.length > 0) setForm((f) => ({ ...f, cvId: data.cvs[0]._id }))
      })
      .catch(() => setError('Failed to load CVs'))
      .finally(() => setLoadingCvs(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.cvId) return setError('Please select a CV')
    if (!form.jobDescription.trim()) return setError('Job description is required')
    if (form.jobDescription.trim().length < 50)
      return setError('Job description is too short (min 50 characters)')

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Generation failed')
      } else {
        router.push(`/letters/${data.letterId}`)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Generate Cover Letter</h1>
        <p className="text-gray-500 text-sm mb-8">
          Fill in the details below and AI will craft a tailored cover letter for you.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CV Selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Select CV</h2>
            {loadingCvs ? (
              <p className="text-sm text-gray-400">Loading your CVs...</p>
            ) : cvs.length === 0 ? (
              <p className="text-sm text-gray-500">
                No CVs found.{' '}
                <Link href="/cv/upload" className="text-indigo-600 hover:underline">
                  Upload one first.
                </Link>
              </p>
            ) : (
              <select
                value={form.cvId}
                onChange={(e) => setForm({ ...form, cvId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {cvs.map((cv) => (
                  <option key={cv._id} value={cv._id}>
                    {cv.filename}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Job Description</h2>
            <textarea
              value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
              rows={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Paste the full job description here..."
            />
            <p className="text-xs text-gray-400 mt-1">{form.jobDescription.length} characters</p>
          </div>

          {/* Parameters */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
            <h2 className="text-sm font-semibold text-gray-800">Parameters</h2>

            {/* Tone */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Tone</p>
              <div className="flex gap-3 flex-wrap">
                {['formal', 'friendly', 'enthusiastic'].map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tone"
                      value={t}
                      checked={form.tone === t}
                      onChange={(e) => setForm({ ...form, tone: e.target.value })}
                      className="text-indigo-600"
                    />
                    <span className="text-sm capitalize text-gray-700">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Length */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Length</p>
              <div className="flex gap-3 flex-wrap">
                {['short', 'medium', 'long'].map((l) => (
                  <label key={l} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="length"
                      value={l}
                      checked={form.length === l}
                      onChange={(e) => setForm({ ...form, length: e.target.value })}
                      className="text-indigo-600"
                    />
                    <span className="text-sm capitalize text-gray-700">{l}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Language</p>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="English">English</option>
                <option value="Romanian">Romanian</option>
              </select>
            </div>

            {/* Emphasis */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Emphasis</p>
              <div className="flex gap-3 flex-wrap">
                {['skills', 'experience', 'motivation'].map((em) => (
                  <label key={em} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="emphasis"
                      value={em}
                      checked={form.emphasis === em}
                      onChange={(e) => setForm({ ...form, emphasis: e.target.value })}
                      className="text-indigo-600"
                    />
                    <span className="text-sm capitalize text-gray-700">{em}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cvs.length === 0}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating with AI...
              </>
            ) : (
              'Generate Cover Letter'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
