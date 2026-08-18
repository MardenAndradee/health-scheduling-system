'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { agendamentosApi, consultasApi } from '@/lib/api'
import { Agendamento, Consulta } from '@/types'
import { Card, Button, Loading, Empty, StatusBadge } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'

export default function PortalInicioPage() {
  const { usuario } = useAuth()
  const [proximo, setProximo] = useState<Agendamento | null>(null)
  const [ultimasConsultas, setUltimasConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    Promise.all([
      agendamentosApi.buscarPorPaciente(usuario.id),
      consultasApi.buscarPorPaciente(usuario.id),
    ]).then(([agendamentos, consultas]) => {
      const agora = Date.now()
      const proximoEncontrado = agendamentos
        .filter(a => (a.status === 'AGENDADO' || a.status === 'CONFIRMADO') && new Date(a.dataConsulta).getTime() >= agora)
        .sort((a, b) => new Date(a.dataConsulta).getTime() - new Date(b.dataConsulta).getTime())[0]
      setProximo(proximoEncontrado || null)
      setUltimasConsultas(
        [...consultas]
          .sort((a, b) => new Date(b.dataConsulta).getTime() - new Date(a.dataConsulta).getTime())
          .slice(0, 2)
      )
    }).finally(() => setLoading(false))
  }, [usuario])

  if (loading) return <Loading />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Olá, {usuario?.nome.split(' ')[0]}</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Bem-vindo ao seu portal.</p>
      </div>

      <Card>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 10, letterSpacing: '.05em' }}>
          PRÓXIMO ATENDIMENTO
        </div>
        {proximo ? (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{formatDateTime(proximo.dataConsulta)}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
              com {proximo.profissional?.nome || '—'}
            </div>
            <StatusBadge status={proximo.status} />
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            Você não tem nenhum atendimento agendado no momento.
          </p>
        )}
      </Card>

      <Link href="/portal/solicitar" style={{ textDecoration: 'none' }}>
        <Button style={{ width: '100%', justifyContent: 'center' }}>+ Solicitar atendimento</Button>
      </Link>

      <div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 10, letterSpacing: '.05em' }}>
          ÚLTIMAS CONSULTAS
        </div>
        {ultimasConsultas.length === 0 ? (
          <Empty message="Você ainda não tem consultas registradas." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ultimasConsultas.map(c => (
              <Card key={c.id}>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 4 }}>
                  {formatDateTime(c.dataConsulta)}
                </div>
                <div style={{ fontSize: 13.5 }}>{c.diagnostico || 'Sem diagnóstico registrado.'}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
