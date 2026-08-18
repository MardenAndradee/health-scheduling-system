'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Stethoscope, CalendarDays, ClipboardList,
  Building2, UserCog, KeyRound, Menu, X, type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface NavLink {
  href: string
  icon: LucideIcon
  label: string
}

const linksBase: NavLink[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/pacientes', icon: Users, label: 'Pacientes' },
  { href: '/anamneses', icon: Stethoscope, label: 'Triagem' },
  { href: '/agendamentos', icon: CalendarDays, label: 'Agendamentos' },
  { href: '/consultas', icon: ClipboardList, label: 'Consultas' },
]

const linksAdmin: NavLink[] = [
  { href: '/admin', icon: Building2, label: 'Painel Admin' },
  { href: '/admin/profissionais', icon: UserCog, label: 'Profissionais' },
  { href: '/admin/usuarios', icon: KeyRound, label: 'Usuários' },
]

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 34, height: 34, background: 'var(--accent)', borderRadius: 9,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17, fontWeight: 700, color: '#fff',
      }}>+</div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--chrome-text)' }}>Triagem</div>
        <div style={{ fontSize: 11, color: 'var(--chrome-muted)' }}>Posto de Saúde</div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { usuario, logout } = useAuth()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [menuAberto, setMenuAberto] = useState(false)

  const links = usuario?.tipoUsuario === 'ADMIN' ? [...linksBase, ...linksAdmin] : linksBase

  const nav = (
    <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {links.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link key={href} href={href} onClick={() => setMenuAberto(false)} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '10px 12px',
            borderRadius: 'var(--radius)',
            fontSize: 14,
            fontWeight: active ? 600 : 400,
            color: active ? '#fff' : 'var(--chrome-muted)',
            background: active ? 'var(--accent)' : 'transparent',
            textDecoration: 'none',
            transition: 'background .15s, color .15s',
          }}>
            <Icon size={18} strokeWidth={2} style={{ flexShrink: 0, opacity: active ? 1 : .85 }} aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  const rodape = (
    <div style={{ padding: '16px 20px 0', borderTop: '1px solid var(--chrome-border)' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--chrome-text)' }}>{usuario?.nome}</div>
      <div style={{ fontSize: 11.5, color: 'var(--chrome-muted)', marginBottom: 10 }}>
        {usuario?.tipoUsuario === 'ADMIN' ? 'Administrador' : 'Profissional'}
      </div>
      <button onClick={logout} style={{
        background: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)', borderRadius: 'var(--radius)',
        padding: '8px 12px', fontSize: 13, color: 'var(--chrome-text)', cursor: 'pointer', width: '100%',
        fontFamily: 'Inter, sans-serif',
      }}>
        Sair
      </button>
    </div>
  )

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{
          width: 232, minHeight: '100vh', background: 'var(--chrome-bg)',
          display: 'flex', flexDirection: 'column',
          padding: '24px 0', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
        }}>
          <div style={{ padding: '0 20px 28px' }}><Logo /></div>
          {nav}
          {rodape}
        </aside>
        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', background: 'var(--bg)' }}>
          <div style={{ maxWidth: 1100 }}>{children}</div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: 'var(--chrome-bg)',
      }}>
        <Logo />
        <button
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuAberto(v => !v)}
          style={{
            background: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)', borderRadius: 'var(--radius)',
            width: 38, height: 38, color: 'var(--chrome-text)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {menuAberto ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      {menuAberto && (
        <div style={{
          position: 'fixed', inset: '65px 0 0 0', zIndex: 39,
          background: 'var(--chrome-bg)', display: 'flex', flexDirection: 'column',
          padding: '16px 0', overflowY: 'auto',
        }}>
          {nav}
          {rodape}
        </div>
      )}

      <main style={{ padding: '20px 16px 40px' }}>{children}</main>
    </div>
  )
}
