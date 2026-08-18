'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button, Loading } from '@/components/ui'
import { TipoUsuario } from '@/types'

export function Guard({ papeis, children }: { papeis: TipoUsuario[]; children: ReactNode }) {
  const { usuario, carregando } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (carregando) return
    if (!usuario) router.replace('/login')
  }, [carregando, usuario, router])

  if (carregando || !usuario) return <Loading />

  if (!papeis.includes(usuario.tipoUsuario)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Acesso negado</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            Você não tem permissão para acessar esta área.
          </p>
          <Button onClick={() => router.replace('/')}>Voltar</Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
