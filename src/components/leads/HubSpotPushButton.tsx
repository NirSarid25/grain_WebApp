'use client'

import { useState } from 'react'

export function HubSpotPushButton({ leadId, synced }: { leadId: string; synced: boolean }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(synced ? 'done' : 'idle')

  async function push() {
    setStatus('loading')
    const res = await fetch('/api/hubspot/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    })
    setStatus(res.ok ? 'done' : 'error')
  }

  if (status === 'done') {
    return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Synced</span>
  }
  if (status === 'error') {
    return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Failed</span>
  }
  return (
    <button
      onClick={push}
      disabled={status === 'loading'}
      className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full hover:bg-orange-200 disabled:opacity-50"
    >
      {status === 'loading' ? 'Pushing…' : 'Push to HubSpot'}
    </button>
  )
}
