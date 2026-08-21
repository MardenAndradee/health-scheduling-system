'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { agendamentosApi, anamnesesApi, pacientesApi, profissionaisApi } from '@/lib/api'
import { Anamnese, AnamneseForm, Paciente, Profissional } from '@/types'
import {
  PageHeader, Card, Button, Input, Select, Textarea, Modal,
  Empty, Loading, Toast,
} from '@/components/ui'
import { formatDateTime, mensagemErro } from '@/lib/utils'

const empty: AnamneseForm = { sintomas: '', observacoes: '', nivelUrgencia: 'VERDE', pacienteId: 0 }

interface AgendarForm {
  profissionalId: number
  dataConsulta: string
  observacoes: string
}

const agendarVazio: AgendarForm = { profissionalId: 0, dataConsulta: '', observacoes: '' }

export default function AnamnesesPage() {
  const [lista, setLista]           = useState<Anamnese[]>([])
  const [pacientes, setPacientes]   = useState<Paciente[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState<'criar' | 'editar' | null>(null)
  const [selected, setSelected]     = useState<Anamnese | null>(null)
  const [form, setForm]             = useState<AnamneseForm>(empty)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const [agendarAlvo, setAgendarAlvo]   = useState<Anamnese | null>(null)
  const [agendarForm, setAgendarForm]   = useState<AgendarForm>(agendarVazio)
  const [agendarSalvando, setAgendarSalvando] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([anamnesesApi.listar(), pacientesApi.listar(), profissionaisApi.listar()])
      .then(([an, pac, prof]) => { setLista(an); setPacientes(pac); setProfissionais(prof) })
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
      })
      showToast('Agendamento criado!', 'success')
      setAgendarAlvo(null)
    } catch (e) { showToast(mensagemErro(e), 'error') }
    finally { setAgendarSalvando(false) }
  }

  const f = (k: keyof AnamneseForm) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: k === 'pacienteId' ? Number(v) : v }))

  return (
    <div>
      <PageHeader
        title="Anamneses"
        subtitle="Registros de anamnese dos pacientes"
        action={<Button onClick={openCriar}>+ Nova anamnese</Button>}
      />

      {loading ? <Loading /> : lista.length === 0 ? <Empty message="Nenhuma anamnese registrada." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lista.map(a => (
            <Card key={a.id} style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start',
              justifyContent: 'space-between', gap: 16, padding: '14px 18px',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{a.paciente?.nome || '—'}</span>
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
                <Button size="sm" onClick={() => { setAgendarAlvo(a); setAgendarForm(agendarVazio) }}>Agendar</Button>
                <Button size="sm" variant="ghost" onClick={() => openEditar(a)}>Editar</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}><X size={14} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal criar/editar anamnese */}
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
              placeholder="Descreva os sintomas relatados pelo paciente..." rows={4} />
            <Textarea label="Observações" value={form.observacoes} onChange={f('observacoes')}
              placeholder="Observações adicionais..." rows={2} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal agendar a partir da anamnese */}
      {agendarAlvo && (
        <Modal
          title={`Agendar — ${agendarAlvo.paciente?.nome || ''}`}
          onClose={() => setAgendarAlvo(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Select
              label="Profissional"
              value={agendarForm.profissionalId ? String(agendarForm.profissionalId) : ''}
              onChange={v => setAgendarForm(prev => ({ ...prev, profissionalId: Number(v) }))}
              options={profissionais.map(p => ({ value: String(p.id), label: `${p.nome} — ${p.especialidade}` }))}
              required
            />
            <Input
              label="Data e hora"
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
