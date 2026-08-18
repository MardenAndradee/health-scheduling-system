'use client'

import { useEffect, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Stethoscope, CalendarDays } from 'lucide-react'
import { pacientesApi, profissionaisApi, anamnesesApi, agendamentosApi, consultasApi } from '@/lib/api'
import { StatCard, Card, UrgenciaBadge, StatusBadge, Loading } from '@/components/ui'
import { Agendamento, Anamnese, NivelUrgencia, StatusAgendamento } from '@/types'
import { formatDateTime, statusConfig, urgenciaConfig } from '@/lib/utils'

const tooltipStyle = {
  contentStyle: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 12.5, fontFamily: 'Inter, sans-serif',
    boxShadow: 'var(--shadow-md)',
  },
  labelStyle: { color: 'var(--text)', fontWeight: 600 },
}

function contarPorUrgencia(anamneses: Anamnese[]) {
  return (Object.keys(urgenciaConfig) as NivelUrgencia[])
    .map(nivel => ({ nivel, label: urgenciaConfig[nivel].label, cor: urgenciaConfig[nivel].color, total: anamneses.filter(a => a.nivelUrgencia === nivel).length }))
    .filter(d => d.total > 0)
}

function contarPorStatus(agendamentos: Agendamento[]) {
  return (Object.keys(statusConfig) as StatusAgendamento[])
    .map(status => ({ status, label: statusConfig[status].label, cor: statusConfig[status].color, total: agendamentos.filter(a => a.status === status).length }))
}

// Agendamentos não podem ser no passado (regra de negócio do backend), então a
// janela fica centrada em hoje em vez de olhar só para trás — senão o gráfico
// tenderia a mostrar sempre zero.
function contarPorDia(agendamentos: Agendamento[], diasAntes = 3, diasDepois = 3) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const janela = Array.from({ length: diasAntes + diasDepois + 1 }, (_, i) => {
    const d = new Date(hoje)
    d.setDate(d.getDate() - diasAntes + i)
    return d
  })
  return janela.map(dia => {
    const chave = dia.toDateString()
    const total = agendamentos.filter(a => new Date(a.dataConsulta).toDateString() === chave).length
    return { label: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), total }
  })
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ pacientes: 0, profissionais: 0, agendamentos: 0, consultas: 0 })
  const [triagem, setTriagem] = useState<Anamnese[]>([])
  const [proximos, setProximos] = useState<Agendamento[]>([])
  const [urgenciaData, setUrgenciaData] = useState<ReturnType<typeof contarPorUrgencia>>([])
  const [statusData, setStatusData] = useState<ReturnType<typeof contarPorStatus>>([])
  const [porDiaData, setPorDiaData] = useState<ReturnType<typeof contarPorDia>>([])
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
      setUrgenciaData(contarPorUrgencia(tri))
      setStatusData(contarPorStatus(age))
      setPorDiaData(contarPorDia(age))
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Pacientes" value={stats.pacientes} />
        <StatCard label="Profissionais" value={stats.profissionais} />
        <StatCard label="Agendamentos" value={stats.agendamentos} />
        <StatCard label="Consultas" value={stats.consultas} accent />
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Distribuição por urgência</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>Fila de triagem atual</div>
          {urgenciaData.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>Sem dados de triagem.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={urgenciaData} dataKey="total" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {urgenciaData.map(d => <Cell key={d.nivel} fill={d.cor} stroke="var(--surface)" />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11.5 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Agendamentos por status</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>Todos os agendamentos</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--muted)' }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} width={28} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {statusData.map(d => <Cell key={d.status} fill={d.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Atendimentos por dia</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>3 dias atrás até 3 dias à frente</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={porDiaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--muted)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} width={28} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3.5, fill: '#2563EB' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Fila de triagem */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stethoscope size={16} color="var(--accent)" />
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
            <CalendarDays size={16} color="var(--accent)" />
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
