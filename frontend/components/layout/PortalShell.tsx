'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Stethoscope, CalendarDays, ClipboardList } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

const links = [
  { href: '/portal/inicio', icon: Home, label: 'Início' },
  { href: '/portal/solicitar', icon: Stethoscope, label: 'Solicitar' },
  { href: '/portal/agendamentos', icon: CalendarDays, label: 'Agenda' },
  { href: '/portal/consultas', icon: ClipboardList, label: 'Consultas' },
]

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: 'var(--chrome-bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 30, height: 30, background: 'var(--accent)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff',
          }}>+</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--chrome-text)' }}>Triagem</span>
        </div>
        <button onClick={logout} style={{
          background: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)', borderRadius: 'var(--radius)',
          padding: '7px 13px', fontSize: 13, color: 'var(--chrome-text)', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}>
          Sair
        </button>
      </header>

      <main style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '20px 16px 96px' }}>
        {children}
      </main>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
        display: 'flex', background: 'var(--chrome-bg)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '10px 4px', textDecoration: 'none', minHeight: 56,
              color: active ? '#fff' : 'var(--chrome-muted)',
            }}>
              <Icon size={21} strokeWidth={active ? 2.25 : 2} aria-hidden />
              <span style={{ fontSize: 11, fontWeight: active ? 600 : 500 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
