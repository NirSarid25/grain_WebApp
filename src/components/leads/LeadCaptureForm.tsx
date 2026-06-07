'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Conference } from '@/generated/prisma/client'

export default function LeadCaptureForm({ conferences }: { conferences: Conference[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push('/leads')
      router.refresh()
    } else {
      const err = await res.json()
      setError(err.error ?? 'Failed to save lead')
      setLoading(false)
    }
  }

  const field = (label: string, name: string, opts?: { type?: string; required?: boolean; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{opts?.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        name={name}
        type={opts?.type ?? 'text'}
        required={opts?.required}
        placeholder={opts?.placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Conference<span className="text-red-500 ml-0.5">*</span></label>
        <select
          name="conferenceId"
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="">Select conference…</option>
          {conferences.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('First name', 'firstName', { required: true, placeholder: 'Alex' })}
        {field('Last name', 'lastName', { required: true, placeholder: 'Chen' })}
      </div>

      {field('Company', 'company', { required: true, placeholder: 'Acme Payments Ltd' })}
      {field('Title', 'title', { placeholder: 'VP Payments' })}
      {field('Email', 'email', { type: 'email', placeholder: 'alex@acme.com' })}
      {field('Phone', 'phone', { type: 'tel', placeholder: '+44 7700 000000' })}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Quick context from the conversation…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-4 rounded-xl text-base font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving…' : 'Save Lead'}
      </button>
    </form>
  )
}
