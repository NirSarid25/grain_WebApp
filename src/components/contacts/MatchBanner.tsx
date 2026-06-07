'use client'

export default function MatchBanner({ name, previousConference }: { name: string; previousConference: string }) {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
      <span className="text-2xl">🔗</span>
      <div>
        <p className="font-semibold text-amber-900">Existing contact recognized!</p>
        <p className="text-sm text-amber-700">
          You&apos;ve met <span className="font-medium">{name}</span> before — first encountered at{' '}
          <span className="font-medium">{previousConference}</span>. Their full relationship history is below.
        </p>
      </div>
    </div>
  )
}
