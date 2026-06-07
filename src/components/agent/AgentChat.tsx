'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string; phase?: string }

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    const query = input.trim()
    if (!query || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: query }])
    setLoading(true)
    try {
      const res = await fetch('/api/agent/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response ?? data.error ?? 'No response',
        phase: data.phase,
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error contacting agent.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col h-80">
      <h2 className="font-semibold text-gray-900 mb-3">Ask the Agent</h2>
      <div className="flex-1 overflow-y-auto space-y-2 text-sm mb-3">
        {messages.length === 0 && (
          <p className="text-gray-400 text-xs">Ask about conferences, leads, follow-ups…</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              m.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {m.role === 'assistant' && m.phase && (
                <span className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">{m.phase} agent</span>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="e.g. Which conferences should we attend in Q3?"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={send}
          disabled={loading}
          className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
