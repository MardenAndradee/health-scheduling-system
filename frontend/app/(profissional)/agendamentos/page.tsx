'use client'

import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, List as ListIcon, X } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { agendamentosApi, anamnesesApi, consultasApi, pacientesApi, profissionaisApi } from '@/lib/api'
import { Agendamento, AgendamentoForm, Anamnese, ConsultaForm, Paciente, Profissional, StatusAgendamento } from '@/types'
import {
  PageHeader, Card, Button, Input, Select, Textarea,
  Modal, Empty, Loading, Toast, StatusBadge, UrgenciaBadge,
} from '@/components/ui'
import { formatDateTime, mensagemErro, statusConfig } from '@/lib/utils'

const empty: AgendamentoForm = {
  dataConsulta: '', status: 'AGENDADO', observacoes: '', pacienteId: 0, profissionalId: 0,
}

const consultaVazia: ConsultaForm = {
  diagnostico: '', prescricao: '', dataConsulta: '', observacoes: '', pacienteId: 0, profissionalId: 0,
}

const statusOpts = Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label }))
const statusAbertos: StatusAgendamento[] = ['AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO']

export default function AgendamentosPage() {
  const { usuario } = useAuth()
  const ehProfissional = usuario?.tipoUsuario === 'PROFISSIONAL'

  const [view, setView] = useState<'minha' | 'todos'>(ehProfissional ? 'minha' : 'todos')

  const [lista, setLista] = useState<Agendamento[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'criar' | 'editar' | null>(null)
  const [selected, setSelected] = useState<Agendamento | null>(null)
  const [form, setForm] = useState<AgendamentoForm>(empty)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')

  const [minhaAgenda, setMinhaAgenda] = useState<Agendamento[]>([])
  const [anamnesesPorPaciente, setAnamnesesPorPaciente] = useState<Record<number, Anamnese | null>>({})
  const [loadingMinha, setLoadingMinha] = useState(true)
  const [consultaAlvo, setConsultaAlvo] = useState<Agendamento | null>(null)
  const [consultaForm, setConsultaForm] = useState<ConsultaForm>(consultaVazia)
  const [consultaSalvando, setConsultaSalvando] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([agendamentosApi.listar(), pacientesApi.listar(), profissionaisApi.listar()])
      .then(([age, pac, prof]) => { setLista(age); setPacientes(pac); setProfissionais(prof) })
      .finally(() => setLoading(false))
  }

  const loadMinhaAgenda = useCallback(() => {
    if (!usuario || usuario.tipoUsuario !== 'PROFISSIONAL') return
    setLoadingMinha(true)
    agendamentosApi.buscarPorProfissional(usuario.id)
      .then(async (agenda) => {
        const ordenada = [...agenda].sort((a, b) => new Date(a.dataConsulta).getTime() - new Date(b.dataConsulta).getTime())
        setMinhaAgenda(ordenada)

        const pacientesUnicos = Array.from(new Set(ordenada.map(a => a.paciente.id)))
        const entradas = await Promise.all(
          pacientesUnicos.map(async (pid) => {
            const historico = await anamnesesApi.buscarPorPaciente(pid).catch(() => [])
            return [pid, historico[0] || null] as const
          })
        )
        setAnamnesesPorPaciente(Object.fromEntries(entradas))
      })
      .catch(() => { setMinhaAgenda([]) })
      .finally(() => setLoadingMinha(false))
  }, [usuario])

  useEffect(() => { load() }, [])
  useEffect(() => { loadMinhaAgenda() }, [loadMinhaAgenda])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  const openCriar = () => { setForm(empty); setModal('criar') }
  const openEditar = (a: Agendamento) => {
    setSelected(a)
    setForm({
      dataConsulta: a.dataConsulta.slice(0, 16),
      status: a.status, observacoes: a.observacoes || '',
      pacienteId: a.paciente.id, profissionalId: a.profissional.id,
    })
    setModal('editar')
  }

  const recarregarTudo = () => { load(); if (ehProfissional) loadMinhaAgenda() }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal === 'criar') await agendamentosApi.criar(form)
      else if (selected) await agendamentosApi.atualizar(selected.id, form)
      showToast('Salvo com sucesso!', 'success')
      setModal(null)
      recarregarTudo()
    } catch (e) { showToast(mensagemErro(e), 'error') }
    finally { setSaving(false) }
  }

  const handleStatus = async (id: number, status: StatusAgendamento) => {
    try {
      await agendamentosApi.atualizarStatus(id, status)
      showToast('Status atualizado!', 'success')
      recarregarTudo()
    } catch (e) { showToast(mensagemErro(e), 'error') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover agendamento?')) return
    try {
      await agendamentosApi.deletar(id)
      showToast('Agendamento removido.', 'success')
      recarregarTudo()
    } catch (e) { showToast(mensagemErro(e), 'error') }
  }

  const f = (k: keyof AgendamentoForm) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: (k === 'pacienteId' || k === 'profissionalId') ? Number(v) : v }))

  const filtered = filterStatus ? lista.filter(a => a.status === filterStatus) : lista

  const abrirConsulta = (a: Agendamento) => {
    setConsultaAlvo(a)
    setConsultaForm({
      ...consultaVazia,
      dataConsulta: a.dataConsulta.slice(0, 16),
      pacienteId: a.paciente.id,
      profissionalId: a.profissional.id,
    })
  }

  const confirmarConsulta = async () => {
    if (!consultaAlvo) return
    setConsultaSalvando(true)
    try {
      await consultasApi.criar(consultaForm)
      await agendamentosApi.atualizarStatus(consultaAlvo.id, 'CONCLUIDO')
      showToast('Consulta registrada e agendamento concluído!', 'success')
      setConsultaAlvo(null)
      recarregarTudo()
    } catch (e) { showToast(mensagemErro(e), 'error') }
    finally { setConsultaSalvando(false) }
  }

  const cf = (k: keyof ConsultaForm) => (v: string) => setConsultaForm(prev => ({ ...prev, [k]: v }))

  return (
    <div>
      <PageHeader
        title="Agendamentos"
        subtitle={ehProfissional ? 'Sua agenda e todos os agendamentos do posto' : `${lista.length} agendamento${lista.length !== 1 ? 's' : ''}`}
        action={<Button onClick={openCriar}>+ Novo agendamento</Button>}
      />

      {ehProfissional && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['minha', 'todos'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13.5,
              fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: view === v ? 600 : 400,
              background: view === v ? 'var(--accent)' : 'var(--surface)',
              border: `1px solid ${view === v ? 'var(--accent)' : 'var(--border)'}`,
              color: view === v ? '#fff' : 'var(--muted)',
            }}>
              {v === 'minha' ? <CalendarDays size={15} /> : <ListIcon size={15} />}
              {v === 'minha' ? 'Minha agenda' : 'Todos os agendamentos'}
            </button>
          ))}
        </div>
      )}

      {ehProfissional && view === 'minha' ? (
        loadingMinha ? <Loading /> : minhaAgenda.length === 0 ? (
          <Empty message="Você não tem agendamentos. Quando alguém marcar uma consulta com você, ela aparece aqui." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {minhaAgenda.map(a => {
              const anamnese = anamnesesPorPaciente[a.paciente.id]
              const podeConcluir = statusAbertos.includes(a.status)
              return (
                <Card key={a.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600 }}>{a.paciente?.nome || '—'}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>
                      {formatDateTime(a.dataConsulta)}
                    </div>
                    <div style={{
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', padding: '10px 12px',
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.05em', marginBottom: 6 }}>
                        ANAMNESE DO PACIENTE
                      </div>
                      {anamnese ? (
                        <div>
                          <div style={{ marginBottom: 4 }}><UrgenciaBadge nivel={anamnese.nivelUrgencia} /></div>
                          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>{anamnese.sintomas}</p>
                        </div>
                      ) : (
                        <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>Sem anamnese registrada para este paciente.</p>
                      )}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <Button size="sm" onClick={() => abrirConsulta(a)} disabled={!podeConcluir}>
                      Registrar consulta
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      ) : (
        <>
          {/* Filter */}
          <div style={{ marginBottom: 16 }}>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)',
                fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">Todos os status</option>
              {statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? <Loading /> : filtered.length === 0 ? <Empty message="Nenhum agendamento encontrado." /> : (
            <Card style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                    {['Data/Hora', 'Paciente', 'Profissional', 'Status', 'Observações', ''].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap',
                        fontSize: 11.5, color: 'var(--muted)', fontWeight: 500, letterSpacing: '.05em',
                      }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '13px 16px', fontSize: 13, fontVariantNumeric: 'tabular-nums', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {formatDateTime(a.dataConsulta)}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap' }}>{a.paciente?.nome || '—'}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{a.profissional?.nome || '—'}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <select
                          value={a.status}
                          onChange={e => handleStatus(a.id, e.target.value as StatusAgendamento)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 500, color: statusConfig[a.status].color,
                            outline: 'none',
                          }}
                        >
                          {statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)', maxWidth: 160 }}>
                        {a.observacoes ? (a.observacoes.slice(0, 40) + (a.observacoes.length > 40 ? '…' : '')) : '—'}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <Button size="sm" variant="ghost" onClick={() => openEditar(a)}>Editar</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}><X size={14} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      {modal && (
        <Modal title={modal === 'criar' ? 'Novo agendamento' : 'Editar agendamento'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select label="Paciente" value={form.pacienteId ? String(form.pacienteId) : ''}
              onChange={f('pacienteId')} options={pacientes.map(p => ({ value: String(p.id), label: p.nome }))} required />
            <Select label="Profissional" value={form.profissionalId ? String(form.profissionalId) : ''}
              onChange={f('profissionalId')} options={profissionais.map(p => ({ value: String(p.id), label: `${p.nome} — ${p.especialidade}` }))} required />
            <Input label="Data e hora da consulta" value={form.dataConsulta} onChange={f('dataConsulta')} type="datetime-local" required />
            <Select label="Status" value={form.status} onChange={f('status')} options={statusOpts} required />
            <Textarea label="Observações" value={form.observacoes} onChange={f('observacoes')} rows={2} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {consultaAlvo && (
        <Modal title={`Registrar consulta — ${consultaAlvo.paciente?.nome || ''}`} onClose={() => setConsultaAlvo(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Textarea label="Diagnóstico" value={consultaForm.diagnostico} onChange={cf('diagnostico')} rows={2} placeholder="Descrição do diagnóstico..." />
            <Textarea label="Prescrição" value={consultaForm.prescricao} onChange={cf('prescricao')} rows={3} placeholder="Medicamentos, dosagens, orientações..." />
            <Textarea label="Observações" value={consultaForm.observacoes} onChange={cf('observacoes')} rows={2} />
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              Ao salvar, o agendamento é marcado automaticamente como concluído.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Button variant="ghost" onClick={() => setConsultaAlvo(null)}>Cancelar</Button>
              <Button onClick={confirmarConsulta} disabled={consultaSalvando}>
                {consultaSalvando ? 'Salvando...' : 'Registrar consulta'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
