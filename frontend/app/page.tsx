'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Loading } from '@/components/ui'
import { rotaInicialPorPapel } from '@/lib/auth'

export default function HomePage() {
  const { usuario, carregando } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (carregando) return
    router.replace(usuario ? rotaInicialPorPapel(usuario.tipoUsuario) : '/login')
  }, [carregando, usuario, router])

  return <Loading />
}
