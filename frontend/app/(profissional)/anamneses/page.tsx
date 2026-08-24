'use client'

import { useEffect, useState } from 'react'
import { Stethoscope, List as ListIcon, X } from 'lucide-react'
import { agendamentosApi, anamnesesApi, pacientesApi, profissionaisApi } from '@/lib/api'
import { Anamnese, AnamneseForm, Paciente, Profissional } from '@/types'
import {
  PageHeader, Card, Button, Input, Select, Textarea, Modal,
  Empty, Loading, Toast, UrgenciaBadge,
} from '@/components/ui'
import { formatDateTime, mensagemErro, urgenciaConfig } from '@/lib/utils'

const empty: AnamneseForm = { sintomas: '', observacoes: '', nivelUrgencia: 'VERDE', pacienteId: 0 }

const urgenciaOpts = Object.entries(urgenciaConfig).map(([v, c]) => ({ value: v, label: c.label }))

interface AgendarForm {
  profissionalId: number
  dataConsulta: string
  observacoes: string
}

const agendarVazio: AgendarForm = { profissionalId: 0, dataConsulta: '', observacoes: '' }

export default function AnamnesesPage() {
  const [lista, setLista] = useState<Anamnese[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'lista' | 'triagem'>('triagem')
  const [modal, setModal] = useState<'criar' | 'editar' | null>(null)
  const [selected, setSelected] = useState<Anamnese | null>(null)
  const [form, setForm] = useState<AnamneseForm>(empty)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const [agendarAlvo, setAgendarAlvo] = useState<Anamnese | null>(null)
  const [agendarForm, setAgendarForm] = useState<AgendarForm>(agendarVazio)
  const [agendarSalvando, setAgendarSalvando] = useState(false)

  const load = (v: 'lista' | 'triagem' = view) => {
    setLoading(true)
    const anamneses = v === 'triagem' ? anamnesesApi.triagem() : anamnesesApi.listar()
    Promise.all([anamneses, pacientesApi.listar(), profissionaisApi.listar()])
      .then(([an, pac, prof]) => { setLista(an); setPacientes(pac); setProfissionais(prof) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const trocarView = (v: 'lista' | 'triagem') => {
    setView(v)
    load(v)
  }

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
    } catch (e) { showToast(mensagemErro(e), 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover anamnese?')) return
    try {
      await anamnesesApi.deletar(id)
      showToast('Anamnese removida.', 'success')
      load()
    } catch (e) { showToast(mensagemErro(e), 'error') }
  }

  const f = (k: keyof AnamneseForm) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: k === 'pacienteId' ? Number(v) : v }))

  const abrirAgendar = (a: Anamnese) => {
    setAgendarAlvo(a)
    setAgendarForm(agendarVazio)
  }

  const confirmarAgendar = async () => {
    if (!agendarAlvo) return
    setAgendarSalvando(true)
    try {
      await agendamentosApi.criar({
        dataConsulta: agendarForm.dataConsulta,
        status: 'AGENDADO',
        observacoes: agendarForm.observacoes,
        pacienteId: agendarAlvo.paciente.id,
        profissionalId: agendarForm.profissionalId,
        anamneseId: agendarAlvo.id,
      })
      showToast('Agendamento criado!', 'success')
      setAgendarAlvo(null)
      load()
    } catch (e) { showToast(mensagemErro(e), 'error') }
    finally { setAgendarSalvando(false) }
  }

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
          <button key={v} onClick={() => trocarView(v)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13.5,
            fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: view === v ? 600 : 400,
            background: view === v ? 'var(--accent)' : 'var(--surface)',
            border: `1px solid ${view === v ? 'var(--accent)' : 'var(--border)'}`,
            color: view === v ? '#fff' : 'var(--muted)',
          }}>
            {v === 'triagem' ? <Stethoscope size={15} /> : <ListIcon size={15} />}
            {v === 'triagem' ? 'Fila de triagem' : 'Lista completa'}
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
                display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start',
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
                    <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', whiteSpace: 'pre-line' }}>{a.observacoes}</p>
                  )}
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
                    {formatDateTime(a.dataRegistro)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Button size="sm" onClick={() => abrirAgendar(a)}>Agendar</Button>
                  <Button size="sm" variant="ghost" onClick={() => openEditar(a)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}><X size={14} /></Button>
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

      {agendarAlvo && (
        <Modal title={`Agendar atendimento — ${agendarAlvo.paciente?.nome || ''}`} onClose={() => setAgendarAlvo(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              background: 'var(--surface2)', borderRadius: 'var(--radius)',
            }}>
              <UrgenciaBadge nivel={agendarAlvo.nivelUrgencia} />
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{agendarAlvo.sintomas}</span>
            </div>
            <Select
              label="Profissional"
              value={agendarForm.profissionalId ? String(agendarForm.profissionalId) : ''}
              onChange={v => setAgendarForm(prev => ({ ...prev, profissionalId: Number(v) }))}
              options={profissionais.map(p => ({ value: String(p.id), label: `${p.nome} — ${p.especialidade}` }))}
              required
            />
            <Input
              label="Data e hora da consulta"
              value={agendarForm.dataConsulta}
              onChange={v => setAgendarForm(prev => ({ ...prev, dataConsulta: v }))}
              type="datetime-local"
              required
            />
            <Textarea
              label="Observações"
              value={agendarForm.observacoes}
              onChange={v => setAgendarForm(prev => ({ ...prev, observacoes: v }))}
              rows={2}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Button variant="ghost" onClick={() => setAgendarAlvo(null)}>Cancelar</Button>
              <Button
                onClick={confirmarAgendar}
                disabled={agendarSalvando || !agendarForm.profissionalId || !agendarForm.dataConsulta}
              >
                {agendarSalvando ? 'Agendando...' : 'Confirmar agendamento'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
