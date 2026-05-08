'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ letterId }: { letterId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this letter?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/letters/${letterId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/dashboard')
      }
    } catch {
      alert('Failed to delete letter')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-60"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
