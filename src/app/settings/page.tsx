import { prisma } from '@/lib/prisma'
import SettingsForm from '@/components/settings/SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">API keys are stored encrypted in your local database</p>
      </div>
      <SettingsForm
        anthropicApiKey={settings?.anthropicApiKey ?? ''}
        hubspotAccessToken={settings?.hubspotAccessToken ?? ''}
      />
    </div>
  )
}
