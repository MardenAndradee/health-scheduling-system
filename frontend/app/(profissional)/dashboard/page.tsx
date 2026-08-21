'use client'

import { useAuth } from '@/components/auth/AuthProvider'

export default function DashboardPage() {
  const { usuario } = useAuth()

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Dashboard</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)' }}>
        Bem-vindo, {usuario?.nome || 'usuário'}.
      </p>
    </div>
  )
}
