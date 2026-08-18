'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { agendamentosApi } from '@/lib/api'
import { Agendamento } from '@/types'
import { Card, Loading, Empty, StatusBadge, PageHeader } from '@/components/ui'
import { formatDateTime, statusDescricaoPaciente } from '@/lib/utils'

export default function PortalAgendamentosPage() {
  const { usuario } = useAuth()
  const [lista, setLista] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    agendamentosApi.buscarPorPaciente(usuario.id).then(setLista).finally(() => setLoading(false))
  }, [usuario])

  const ordenados = [...lista].sort(
    (a, b) => new Date(b.dataConsulta).getTime() - new Date(a.dataConsulta).getTime()
  )

  return (
    <div>
      <PageHeader title="Meus agendamentos" subtitle="Acompanhe a situação do seu atendimento" />

      {loading ? <Loading /> : ordenados.length === 0 ? (
        <Empty message="Você ainda não tem agendamentos. Assim que sua solicitação for avaliada, a data aparece aqui." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ordenados.map(a => (
            <Card key={a.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{formatDateTime(a.dataConsulta)}</div>
                <StatusBadge status={a.status} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
                com {a.profissional?.nome || '—'}
              </div>
              <div style={{ fontSize: 13 }}>{statusDescricaoPaciente[a.status]}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
