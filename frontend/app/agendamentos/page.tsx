'use client'

import { useEffect, useState } from 'react'
import { agendamentosApi, pacientesApi, profissionaisApi } from '@/lib/api'
import { Agendamento, AgendamentoForm, Paciente, Profissional, StatusAgendamento } from '@/types'
import {
  PageHeader, Card, Button, Input, Select, Textarea,
  Modal, Empty, Loading, Toast, StatusBadge,
} from '@/components/ui'
import { formatDateTime, statusConfig } from '@/lib/utils'

const empty: AgendamentoForm = {
  dataConsulta: '', status: 'AGENDADO', observacoes: '', pacienteId: 0, profissionalId: 0,
}

const statusOpts = Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label }))

export default function AgendamentosPage() {
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

  const load = () => {
    setLoading(true)
    Promise.all([agendamentosApi.listar(), pacientesApi.listar(), profissionaisApi.listar()])
      .then(([age, pac, prof]) => { setLista(age); setPacientes(pac); setProfissionais(prof) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

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

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal === 'criar') await agendamentosApi.criar(form)
      else if (selected) await agendamentosApi.atualizar(selected.id, form)
      showToast('Salvo com sucesso!', 'success')
      setModal(null)
      load()
    } catch (e: any) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleStatus = async (id: number, status: StatusAgendamento) => {
    try {
      await agendamentosApi.atualizarStatus(id, status)
      showToast('Status atualizado!', 'success')
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover agendamento?')) return
    try {
      await agendamentosApi.deletar(id)
      showToast('Agendamento removido.', 'success')
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  const f = (k: keyof AgendamentoForm) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: (k === 'pacienteId' || k === 'profissionalId') ? Number(v) : v }))

  const filtered = filterStatus ? lista.filter(a => a.status === filterStatus) : lista

  return (
    <div>
      <PageHeader
        title="Agendamentos"
        subtitle={`${lista.length} agendamento${lista.length !== 1 ? 's' : ''}`}
        action={<Button onClick={openCriar}>+ Novo agendamento</Button>}
      />

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)',
            fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">Todos os status</option>
          {statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? <Empty message="Nenhum agendamento encontrado." /> : (
        <Card style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Data/Hora', 'Paciente', 'Profissional', 'Status', 'Observações', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
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
                  <td style={{ padding: '13px 16px', fontSize: 13, fontFamily: 'DM Mono', color: 'var(--muted)' }}>
                    {formatDateTime(a.dataConsulta)}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 500 }}>{a.paciente?.nome || '—'}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)' }}>{a.profissional?.nome || '—'}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <select
                      value={a.status}
                      onChange={e => handleStatus(a.id, e.target.value as StatusAgendamento)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontFamily: 'DM Sans', fontSize: 12, color: statusConfig[a.status].color,
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
                      <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>✕</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
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

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
