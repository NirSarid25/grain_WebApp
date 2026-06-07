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
    <aside className="w-60 shrink-0 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">Grain Intel</span>
            <p className="text-slate-400 text-xs">Conference Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-500')} />
              {label}
              {label === 'Capture Lead' && (
                <span className="ml-auto text-xs bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-semibold">+</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <p className="text-xs text-slate-500">Powered by Claude AI</p>
        </div>
      </div>
    </aside>
  )
}
