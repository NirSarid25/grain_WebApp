'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

type ArcResult = { narrative: string; recommendation: string }

export default function ArcSummary({
  contactId,
  contactName,
  leads,
}: {
  contactId: string
  contactName: string
  leads: { conference: string; date: string; title?: string | null; notes?: string | null }[]
}) {
  const [result, setResult] = useState<ArcResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/agent/post?contactId=${contactId}`, { method: 'POST' })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResult(data)
    } catch {
      setError('Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  const recColor = result?.recommendation === 'Ready to close'
    ? 'bg-green-50 border-green-200 text-green-800'
    : result?.recommendation === 'Nurture'
    ? 'bg-blue-50 border-blue-200 text-blue-800'
    : 'bg-red-50 border-red-200 text-red-700'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">AI Relationship Arc</h2>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {result ? 'Regenerate' : 'Generate Summary'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {result && (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">{result.narrative}</p>
          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-sm font-semibold ${recColor}`}>
            {result.recommendation}
          </div>
        </div>
      )}

      {!result && !loading && (
        <p className="text-sm text-gray-400">Click to generate an AI-powered relationship analysis based on {leads.length} conference appearance{leads.length !== 1 ? 's' : ''}.</p>
      )}
    </div>
  )
}
