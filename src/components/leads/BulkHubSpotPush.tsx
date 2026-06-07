'use client'

import { useState } from 'react'

export function BulkHubSpotPush({ pendingLeadIds }: { pendingLeadIds: string[] }) {
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const [pushed, setPushed] = useState(0)
  const total = pendingLeadIds.length

  if (total === 0) return null

  async function pushAll() {
    setStatus('running')
    let count = 0
    for (const leadId of pendingLeadIds) {
      await fetch('/api/hubspot/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })
      count++
      setPushed(count)
    }
    setStatus('done')
  }

  if (status === 'done') {
    return <span className="text-sm text-green-700 font-medium">✓ {total} leads pushed to HubSpot</span>
  }

  return (
    <button
      onClick={pushAll}
      disabled={status === 'running'}
      className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors"
    >
      {status === 'running'
        ? `Pushing… ${pushed}/${total}`
        : `Push all to HubSpot (${total} pending)`}
    </button>
  )
}
