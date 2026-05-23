'use client'

import { useEffect, useState } from 'react'
import { pacientesApi, profissionaisApi, anamnesesApi, agendamentosApi, consultasApi } from '@/lib/api'
import { StatCard, Card, UrgenciaBadge, StatusBadge, Loading } from '@/components/ui'
import { Anamnese, Agendamento } from '@/types'
import { formatDateTime } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState({ pacientes: 0, profissionais: 0, agendamentos: 0, consultas: 0 })
  const [triagem, setTriagem] = useState<Anamnese[]>([])
  const [proximos, setProximos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      pacientesApi.listar(),
      profissionaisApi.listar(),
      agendamentosApi.listar(),
      consultasApi.listar(),
      anamnesesApi.triagem(),
    ]).then(([pac, prof, age, con, tri]) => {
      setStats({ pacientes: pac.length, profissionais: prof.length, agendamentos: age.length, consultas: con.length })
      setTriagem(tri.slice(0, 5))
      setProximos(age.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Visão geral do sistema</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Pacientes" value={stats.pacientes} />
        <StatCard label="Profissionais" value={stats.profissionais} />
        <StatCard label="Agendamentos" value={stats.agendamentos} />
        <StatCard label="Consultas" value={stats.consultas} accent />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Fila de triagem */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--accent)', fontFamily: 'DM Mono' }}>◐</span>
            Fila de Triagem
          </div>
          {triagem.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Nenhum paciente em triagem.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {triagem.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--surface2)',
                  borderRadius: 'var(--radius)',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.paciente?.nome || '—'}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                      {a.sintomas.slice(0, 50)}{a.sintomas.length > 50 ? '…' : ''}
                    </div>
                  </div>
                  <UrgenciaBadge nivel={a.nivelUrgencia} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Próximos agendamentos */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--accent)', fontFamily: 'DM Mono' }}>◷</span>
            Próximos Agendamentos
          </div>
          {proximos.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Nenhum agendamento encontrado.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {proximos.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--surface2)',
                  borderRadius: 'var(--radius)',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.paciente?.nome || '—'}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                      {formatDateTime(a.dataConsulta)} · {a.profissional?.nome || '—'}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
