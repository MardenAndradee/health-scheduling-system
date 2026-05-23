'use client'

import { useEffect, useState } from 'react'
import { consultasApi, pacientesApi, profissionaisApi } from '@/lib/api'
import { Consulta, ConsultaForm, Paciente, Profissional } from '@/types'
import {
  PageHeader, Card, Button, Input, Select, Textarea,
  Modal, Empty, Loading, Toast,
} from '@/components/ui'
import { formatDateTime } from '@/lib/utils'

const empty: ConsultaForm = {
  diagnostico: '', prescricao: '', dataConsulta: '',
  observacoes: '', pacienteId: 0, profissionalId: 0,
}

export default function ConsultasPage() {
  const [lista, setLista] = useState<Consulta[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'criar' | 'editar' | 'ver' | null>(null)
  const [selected, setSelected] = useState<Consulta | null>(null)
  const [form, setForm] = useState<ConsultaForm>(empty)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([consultasApi.listar(), pacientesApi.listar(), profissionaisApi.listar()])
      .then(([con, pac, prof]) => { setLista(con); setPacientes(pac); setProfissionais(prof) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  const openCriar = () => { setForm(empty); setModal('criar') }
  const openEditar = (c: Consulta) => {
    setSelected(c)
    setForm({
      diagnostico: c.diagnostico || '', prescricao: c.prescricao || '',
      dataConsulta: c.dataConsulta.slice(0, 16), observacoes: c.observacoes || '',
      pacienteId: c.paciente.id, profissionalId: c.profissional.id,
    })
    setModal('editar')
  }
  const openVer = (c: Consulta) => { setSelected(c); setModal('ver') }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal === 'criar') await consultasApi.criar(form)
      else if (selected) await consultasApi.atualizar(selected.id, form)
      showToast('Salvo com sucesso!', 'success')
      setModal(null)
      load()
    } catch (e: any) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover consulta?')) return
    try {
      await consultasApi.deletar(id)
      showToast('Consulta removida.', 'success')
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  const f = (k: keyof ConsultaForm) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: (k === 'pacienteId' || k === 'profissionalId') ? Number(v) : v }))

  return (
    <div>
      <PageHeader
        title="Consultas"
        subtitle={`${lista.length} consulta${lista.length !== 1 ? 's' : ''} registrada${lista.length !== 1 ? 's' : ''}`}
        action={<Button onClick={openCriar}>+ Nova consulta</Button>}
      />

      {loading ? <Loading /> : lista.length === 0 ? <Empty message="Nenhuma consulta registrada." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lista.map(c => (
            <Card key={c.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{c.paciente?.nome || '—'}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>·</span>
                  <span style={{ fontSize: 13, color: 'var(--accent)' }}>{c.profissional?.nome || '—'}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'DM Mono', marginLeft: 'auto' }}>
                    {formatDateTime(c.dataConsulta)}
                  </span>
                </div>
                {c.diagnostico && (
                  <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>
                    <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>DIAGNÓSTICO: </span>
                    {c.diagnostico}
                  </p>
                )}
                {c.prescricao && (
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic' }}>
                    {c.prescricao.slice(0, 100)}{c.prescricao.length > 100 ? '…' : ''}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <Button size="sm" variant="ghost" onClick={() => openVer(c)}>Ver</Button>
                <Button size="sm" variant="ghost" onClick={() => openEditar(c)}>Editar</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>✕</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form modal */}
      {(modal === 'criar' || modal === 'editar') && (
        <Modal title={modal === 'criar' ? 'Nova consulta' : 'Editar consulta'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select label="Paciente" value={form.pacienteId ? String(form.pacienteId) : ''}
              onChange={f('pacienteId')} options={pacientes.map(p => ({ value: String(p.id), label: p.nome }))} required />
            <Select label="Profissional" value={form.profissionalId ? String(form.profissionalId) : ''}
              onChange={f('profissionalId')} options={profissionais.map(p => ({ value: String(p.id), label: `${p.nome} — ${p.especialidade}` }))} required />
            <Input label="Data e hora" value={form.dataConsulta} onChange={f('dataConsulta')} type="datetime-local" />
            <Textarea label="Diagnóstico" value={form.diagnostico} onChange={f('diagnostico')} rows={2} placeholder="Descrição do diagnóstico..." />
            <Textarea label="Prescrição" value={form.prescricao} onChange={f('prescricao')} rows={3} placeholder="Medicamentos, dosagens, orientações..." />
            <Textarea label="Observações" value={form.observacoes} onChange={f('observacoes')} rows={2} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View modal */}
      {modal === 'ver' && selected && (
        <Modal title="Detalhes da consulta" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Paciente', value: selected.paciente?.nome },
              { label: 'Profissional', value: `${selected.profissional?.nome} — ${selected.profissional?.especialidade}` },
              { label: 'Data', value: formatDateTime(selected.dataConsulta) },
              { label: 'Diagnóstico', value: selected.diagnostico || '—' },
              { label: 'Prescrição', value: selected.prescricao || '—' },
              { label: 'Observações', value: selected.observacoes || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.06em', marginBottom: 4 }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{value}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button variant="ghost" onClick={() => openEditar(selected)}>Editar</Button>
              <Button variant="ghost" onClick={() => setModal(null)}>Fechar</Button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
