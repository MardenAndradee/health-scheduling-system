'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard',      icon: '◈', label: 'Dashboard'      },
  { href: '/pacientes',      icon: '◉', label: 'Pacientes'       },
  { href: '/profissionais',  icon: '◎', label: 'Profissionais'   },
  { href: '/anamneses',      icon: '◐', label: 'Anamneses'       },
  { href: '/agendamentos',   icon: '◷', label: 'Agendamentos'    },
  { href: '/consultas',      icon: '◑', label: 'Consultas'       },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 0',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff',
            fontFamily: 'DM Mono, monospace',
          }}>+</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.02em' }}>Triagem</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Posto de Saúde</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map(({ href, icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px',
              borderRadius: 'var(--radius)',
              fontSize: 13.5,
              fontWeight: active ? 500 : 400,
              color: active ? 'var(--text)' : 'var(--muted)',
              background: active ? 'var(--surface2)' : 'transparent',
              textDecoration: 'none',
              transition: 'all .15s',
              borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 14,
                color: active ? 'var(--accent)' : 'inherit',
              }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '20px 24px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
          Sistema de Triagem<br />v1.0.0
        </div>
      </div>
    </aside>
  )
}
