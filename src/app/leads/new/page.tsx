import { prisma } from '@/lib/prisma'
import LeadCaptureForm from '@/components/leads/LeadCaptureForm'

export const dynamic = 'force-dynamic'

export default async function NewLeadPage({
  searchParams,
}: {
  searchParams: Promise<{ conferenceId?: string }>
}) {
  const { conferenceId } = await searchParams
  const conferences = await prisma.conference.findMany({ orderBy: { date: 'desc' } })

  const preselected = conferenceId
    ? conferences.find(c => c.id === conferenceId)
    : null

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Capture Lead</h1>
        <p className="text-gray-500 text-sm mt-1">
          {preselected
            ? <>At <span className="font-medium text-indigo-600">{preselected.name}</span></>
            : 'Quick capture — optimized for conference floor use'}
        </p>
      </div>
      <LeadCaptureForm conferences={conferences} defaultConferenceId={conferenceId} />
    </div>
  )
}
