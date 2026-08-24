'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { agendamentosApi, anamnesesApi } from '@/lib/api'
import { Agendamento, Anamnese } from '@/types'
import { Card, Loading, Empty, StatusBadge, PageHeader } from '@/components/ui'
import { formatDateTime, statusDescricaoPaciente } from '@/lib/utils'

type ItemAgenda =
  | { tipo: 'pendente'; data: string; anamnese: Anamnese }
  | { tipo: 'agendamento'; data: string; agendamento: Agendamento }

export default function PortalAgendamentosPage() {
  const { usuario } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [anamneses, setAnamneses] = useState<Anamnese[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    Promise.all([
      agendamentosApi.buscarPorPaciente(usuario.id),
      anamnesesApi.buscarPorPaciente(usuario.id),
    ]).then(([age, ana]) => { setAgendamentos(age); setAnamneses(ana) })
      .finally(() => setLoading(false))
  }, [usuario])

  // Anamneses que ainda não viraram agendamento — mesma lógica de vínculo
  // usada na fila de triagem do profissional (Agendamento.anamnese).
  const idsComAgendamento = new Set(
    agendamentos.filter(a => a.anamnese).map(a => a.anamnese!.id)
  )
  const pendentes = anamneses.filter(an => !idsComAgendamento.has(an.id))

  const itens: ItemAgenda[] = [
    ...pendentes.map((anamnese): ItemAgenda => ({ tipo: 'pendente', data: anamnese.dataRegistro, anamnese })),
    ...agendamentos.map((agendamento): ItemAgenda => ({ tipo: 'agendamento', data: agendamento.dataConsulta, agendamento })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  return (
    <div>
      <PageHeader title="Meus agendamentos" subtitle="Acompanhe a situação do seu atendimento" />

      {loading ? <Loading /> : itens.length === 0 ? (
        <Empty message="Você ainda não tem agendamentos. Assim que sua solicitação for avaliada, a data aparece aqui." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {itens.map(item => item.tipo === 'pendente' ? (
            <Card key={`pendente-${item.anamnese.id}`}>
              <div style={{ marginBottom: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', padding: '4px 11px',
                  borderRadius: 'var(--radius-full)', fontSize: 12.5, fontWeight: 600,
                  color: 'var(--muted)', background: 'var(--surface2)',
                }}>
                  Aguardando agendamento
                </span>
              </div>
              <div style={{ fontSize: 13 }}>
                Sua solicitação foi recebida e está aguardando avaliação da equipe para marcar a data.
              </div>
            </Card>
          ) : (
            <Card key={`agendamento-${item.agendamento.id}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{formatDateTime(item.agendamento.dataConsulta)}</div>
                <StatusBadge status={item.agendamento.status} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
                com {item.agendamento.profissional?.nome || '—'}
              </div>
              <div style={{ fontSize: 13 }}>{statusDescricaoPaciente[item.agendamento.status]}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
