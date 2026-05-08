'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UploadCVPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!file) return setError('Please select a PDF file')
    if (!file.name.toLowerCase().endsWith('.pdf')) return setError('Only PDF files are accepted')
    if (file.size > 5 * 1024 * 1024) return setError('File must be smaller than 5MB')

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/cv', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/dashboard'), 1500)
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

      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload CV</h1>
        <p className="text-gray-500 text-sm mb-8">
          Upload a PDF version of your CV. We&apos;ll extract the text so the AI can reference your experience.
        </p>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
            CV uploaded successfully! Redirecting to dashboard...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">PDF File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="cv-file"
              />
              <label htmlFor="cv-file" className="cursor-pointer">
                {file ? (
                  <div>
                    <p className="text-2xl mb-2">📄</p>
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <p className="text-xs text-indigo-500 mt-2">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl mb-2">📁</p>
                    <p className="text-sm text-gray-600">
                      <span className="text-indigo-600 font-medium">Click to browse</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF only, max 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Uploading & parsing...' : 'Upload CV'}
          </button>
        </form>
      </div>
    </div>
  )
}
