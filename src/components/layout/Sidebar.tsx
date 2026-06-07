'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Calendar,
  Users,
  UserCheck,
  Settings,
  Zap,
  PlusCircle,
} from 'lucide-react'

const nav = [
  { label: 'Dashboard', href: '/', icon: BarChart3 },
  { label: 'Conferences', href: '/conferences', icon: Calendar },
  { label: 'Planning', href: '/planning', icon: Zap },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Capture Lead', href: '/leads/new', icon: PlusCircle },
  { label: 'Contacts', href: '/contacts', icon: UserCheck },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-5 border-b border-gray-100">
        <span className="text-lg font-bold text-indigo-600 tracking-tight">Grain Intel</span>
        <p className="text-xs text-gray-400 mt-0.5">Conference Intelligence</p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">Powered by Claude</p>
      </div>
    </aside>
  )
}
