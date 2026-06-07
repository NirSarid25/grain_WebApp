'use client'

import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'

export default function FollowUpDrafter({
  leadId,
  firstName,
  lastName,
  company,
  title,
  conferenceName,
  notes,
}: {
  leadId: string
  firstName: string
  lastName: string
  company: string
  title?: string | null
  conferenceName: string
  notes?: string | null
}) {
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/agent/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'draft-email',
          leadId,
          firstName,
          lastName,
          company,
          title,
          conferenceName,
          notes,
        }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setDraft(data.email)
    } catch {
      setError('Failed to draft email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
        {draft ? 'Regenerate draft' : 'Draft follow-up email'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {draft && (
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={6}
          className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      )}
    </div>
  )
}
