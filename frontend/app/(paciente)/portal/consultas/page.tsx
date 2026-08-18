'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { consultasApi } from '@/lib/api'
import { Consulta } from '@/types'
import { Card, Loading, Empty, PageHeader } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'

export default function PortalConsultasPage() {
  const { usuario } = useAuth()
  const [lista, setLista] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    consultasApi.buscarPorPaciente(usuario.id).then(setLista).finally(() => setLoading(false))
  }, [usuario])

  const ordenados = [...lista].sort(
    (a, b) => new Date(b.dataConsulta).getTime() - new Date(a.dataConsulta).getTime()
  )

  return (
    <div>
      <PageHeader title="Minhas consultas" subtitle="Diagnósticos e prescrições recebidos" />

      {loading ? <Loading /> : ordenados.length === 0 ? (
        <Empty message="Você ainda não tem consultas registradas." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ordenados.map(c => (
            <Card key={c.id}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
                {formatDateTime(c.dataConsulta)} · {c.profissional?.nome || '—'}
              </div>
              {c.diagnostico && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.05em', marginBottom: 3 }}>
                    DIAGNÓSTICO
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{c.diagnostico}</div>
                </div>
              )}
              {c.prescricao && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.05em', marginBottom: 3 }}>
                    PRESCRIÇÃO
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{c.prescricao}</div>
                </div>
              )}
              {c.observacoes && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.05em', marginBottom: 3 }}>
                    OBSERVAÇÕES
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{c.observacoes}</div>
                </div>
              )}
              {!c.diagnostico && !c.prescricao && !c.observacoes && (
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sem detalhes registrados para esta consulta.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
