'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { pacientesApi, profissionaisApi, usuariosApi } from '@/lib/api'
import { StatCard, Card, Button, Loading } from '@/components/ui'
import { Usuario } from '@/types'

export default function PainelAdminPage() {
  const [pacientes, setPacientes] = useState(0)
  const [profissionais, setProfissionais] = useState(0)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([pacientesApi.listar(), profissionaisApi.listar(), usuariosApi.listar()])
      .then(([pac, prof, usu]) => {
        setPacientes(pac.length)
        setProfissionais(prof.length)
        setUsuarios(usu)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const admins = usuarios.filter(u => u.tipoUsuario === 'ADMIN').length

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em' }}>Painel Admin</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Visão geral do posto de saúde</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Pacientes" value={pacientes} />
        <StatCard label="Profissionais" value={profissionais} />
        <StatCard label="Administradores" value={admins} />
        <StatCard label="Usuários (total)" value={usuarios.length} accent />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Profissionais do posto</div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
            Cadastre médicos, enfermeiras e secretárias, e gerencie especialidades e CRM.
          </p>
          <Link href="/admin/profissionais" style={{ textDecoration: 'none' }}>
            <Button variant="ghost">Gerenciar profissionais →</Button>
          </Link>
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Usuários do sistema</div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
            Veja todas as contas (pacientes, profissionais e administradores) e crie novos administradores.
          </p>
          <Link href="/admin/usuarios" style={{ textDecoration: 'none' }}>
            <Button variant="ghost">Gerenciar usuários →</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
