import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            CoverLetter<span className="text-indigo-600">AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Generate professional, tailored cover letters in seconds using AI.
            Upload your CV, paste a job description, and let AI craft the perfect letter.
          </p>
          <p className="text-sm text-gray-500 mb-10 max-w-xl mx-auto">
            Powered by <span className="font-semibold text-indigo-500">Google Gemini API</span> and{' '}
            <span className="font-semibold text-indigo-500">MongoDB Atlas</span> — cloud-native from the ground up.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Your CV</h3>
            <p className="text-gray-500 text-sm">
              Upload a PDF CV — we extract the text automatically so the AI understands your background.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Paste Job Description</h3>
            <p className="text-gray-500 text-sm">
              Paste any job posting. Choose tone, length, language, and what to emphasize.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Get Your Letter</h3>
            <p className="text-gray-500 text-sm">
              Receive a tailored cover letter in seconds. Copy it and apply with confidence.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
