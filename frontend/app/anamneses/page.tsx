'use client'

import { useEffect, useState } from 'react'
import { anamnesesApi, pacientesApi } from '@/lib/api'
import { Anamnese, AnamneseForm, NivelUrgencia, Paciente } from '@/types'
import {
  PageHeader, Card, Button, Select, Textarea, Modal,
  Empty, Loading, Toast, UrgenciaBadge,
} from '@/components/ui'
import { formatDateTime, urgenciaConfig } from '@/lib/utils'

const empty: AnamneseForm = { sintomas: '', observacoes: '', nivelUrgencia: 'VERDE', pacienteId: 0 }

const urgenciaOpts = Object.entries(urgenciaConfig).map(([v, c]) => ({ value: v, label: c.label }))

export default function AnamnesesPage() {
  const [lista, setLista] = useState<Anamnese[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'lista' | 'triagem'>('triagem')
  const [modal, setModal] = useState<'criar' | 'editar' | null>(null)
  const [selected, setSelected] = useState<Anamnese | null>(null)
  const [form, setForm] = useState<AnamneseForm>(empty)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([anamnesesApi.triagem(), pacientesApi.listar()])
      .then(([tri, pac]) => { setLista(tri); setPacientes(pac) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCriar = () => { setForm(empty); setModal('criar') }
  const openEditar = (a: Anamnese) => {
    setSelected(a)
    setForm({ sintomas: a.sintomas, observacoes: a.observacoes || '', nivelUrgencia: a.nivelUrgencia, pacienteId: a.paciente.id })
    setModal('editar')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal === 'criar') await anamnesesApi.criar(form)
      else if (selected) await anamnesesApi.atualizar(selected.id, form)
      showToast('Salvo com sucesso!', 'success')
      setModal(null)
      load()
    } catch (e: any) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover anamnese?')) return
    try {
      await anamnesesApi.deletar(id)
      showToast('Anamnese removida.', 'success')
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  const f = (k: keyof AnamneseForm) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: k === 'pacienteId' ? Number(v) : v }))

  return (
    <div>
      <PageHeader
        title="Anamneses"
        subtitle="Registros de triagem ordenados por urgência"
        action={<Button onClick={openCriar}>+ Nova anamnese</Button>}
      />

      {/* Toggle view */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['triagem', 'lista'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius)', fontSize: 13,
            fontFamily: 'DM Sans', cursor: 'pointer', fontWeight: view === v ? 500 : 400,
            background: view === v ? 'var(--surface2)' : 'transparent',
            border: '1px solid var(--border)',
            color: view === v ? 'var(--text)' : 'var(--muted)',
          }}>
            {v === 'triagem' ? '◐ Fila de triagem' : '≡ Lista completa'}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : lista.length === 0 ? <Empty message="Nenhuma anamnese registrada." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lista.map(a => {
            const cfg = urgenciaConfig[a.nivelUrgencia]
            return (
              <Card key={a.id} style={{
                borderLeft: `3px solid ${cfg.color}`,
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', gap: 16, padding: '14px 18px',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{a.paciente?.nome || '—'}</span>
                    <UrgenciaBadge nivel={a.nivelUrgencia} />
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4, lineHeight: 1.5 }}>
                    {a.sintomas}
                  </p>
                  {a.observacoes && (
                    <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>{a.observacoes}</p>
                  )}
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
                    {formatDateTime(a.dataRegistro)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Button size="sm" variant="ghost" onClick={() => openEditar(a)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>✕</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'criar' ? 'Nova anamnese' : 'Editar anamnese'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select
              label="Paciente"
              value={form.pacienteId ? String(form.pacienteId) : ''}
              onChange={f('pacienteId')}
              options={pacientes.map(p => ({ value: String(p.id), label: p.nome }))}
              required
            />
            <Textarea label="Sintomas" value={form.sintomas} onChange={f('sintomas')}
              placeholder="Descreva os sintomas relatados pelo paciente..." rows={3} />
            <Select
              label="Nível de urgência"
              value={form.nivelUrgencia}
              onChange={f('nivelUrgencia')}
              options={urgenciaOpts}
              required
            />
            <Textarea label="Observações" value={form.observacoes} onChange={f('observacoes')}
              placeholder="Observações adicionais..." rows={2} />
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
