'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LayoutDashboard, PlusCircle, FileText, LogOut } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/log', label: 'Log Trade', icon: PlusCircle },
  { href: '/report', label: 'Report', icon: FileText },
]

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: 'rgba(8,10,14,0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '24px',
          height: '24px',
          background: 'var(--green)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ color: '#080A0E', fontSize: '12px', fontWeight: '800' }}>C</span>
        </div>
        <span className="font-display" style={{ fontSize: '18px', color: 'var(--text)', letterSpacing: '0.08em' }}>
          CONVICTION<span style={{ color: 'var(--green)' }}>OS</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
                color: active ? 'var(--green)' : 'var(--text-muted)',
                background: active ? 'var(--accent-dim)' : 'transparent',
                border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: 'none',
          border: '1px solid transparent',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '13px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.target as HTMLElement).style.color = 'var(--red)'
          ;(e.target as HTMLElement).style.borderColor = 'rgba(255,59,92,0.2)'
        }}
        onMouseLeave={e => {
          (e.target as HTMLElement).style.color = 'var(--text-muted)'
          ;(e.target as HTMLElement).style.borderColor = 'transparent'
        }}
      >
        <LogOut size={14} />
        Sign out
      </button>
    </nav>
  )
}
