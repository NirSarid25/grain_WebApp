'use client'

import { useState } from 'react'
import { Eye, EyeOff, Check } from 'lucide-react'

export default function SettingsForm({
  anthropicApiKey,
  hubspotAccessToken,
}: {
  anthropicApiKey: string
  hubspotAccessToken: string
}) {
  const [anthKey, setAnthKey] = useState(anthropicApiKey)
  const [hsToken, setHsToken] = useState(hubspotAccessToken)
  const [showAnth, setShowAnth] = useState(false)
  const [showHs, setShowHs] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anthropicApiKey: anthKey, hubspotAccessToken: hsToken }),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
      else setError('Failed to save settings')
    } catch { setError('Failed to save settings') }
    finally { setLoading(false) }
  }

  const SecretInput = ({
    label, value, onChange, show, onToggle, placeholder,
  }: {
    label: string; value: string; onChange: (v: string) => void
    show: boolean; onToggle: () => void; placeholder: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <SecretInput
        label="Anthropic API Key"
        value={anthKey}
        onChange={setAnthKey}
        show={showAnth}
        onToggle={() => setShowAnth(!showAnth)}
        placeholder="sk-ant-..."
      />
      <SecretInput
        label="HubSpot Access Token"
        value={hsToken}
        onChange={setHsToken}
        show={showHs}
        onToggle={() => setShowHs(!showHs)}
        placeholder="pat-na1-..."
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={save}
        disabled={loading}
        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {saved ? <Check className="w-4 h-4" /> : null}
        {saved ? 'Saved!' : loading ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
