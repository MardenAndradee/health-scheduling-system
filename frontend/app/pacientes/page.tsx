'use client'

import { useEffect, useState } from 'react'
import { pacientesApi } from '@/lib/api'
import { Paciente, PacienteForm } from '@/types'
import {
  PageHeader, Card, Button, Input, Modal, Empty, Loading, Toast,
} from '@/components/ui'
import { formatDate, formatCpf } from '@/lib/utils'

const empty: PacienteForm = {
  nome: '', email: '', senha: '', cpf: '',
  telefone: '', endereco: '', dataNascimento: '',
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'criar' | 'editar' | null>(null)
  const [selected, setSelected] = useState<Paciente | null>(null)
  const [form, setForm] = useState<PacienteForm>(empty)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = () => {
    setLoading(true)
    pacientesApi.listar().then(setPacientes).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCriar = () => { setForm(empty); setModal('criar') }
  const openEditar = (p: Paciente) => {
    setSelected(p)
    setForm({
      nome: p.nome, email: p.email, senha: '',
      cpf: p.cpf, telefone: p.telefone || '',
      endereco: p.endereco || '',
      dataNascimento: p.dataNascimento,
    })
    setModal('editar')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal === 'criar') {
        await pacientesApi.criar(form)
        showToast('Paciente cadastrado com sucesso!', 'success')
      } else if (selected) {
        await pacientesApi.atualizar(selected.id, form)
        showToast('Paciente atualizado!', 'success')
      }
      setModal(null)
      load()
    } catch (e: any) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover paciente?')) return
    try {
      await pacientesApi.deletar(id)
      showToast('Paciente removido.', 'success')
      load()
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  const f = (k: keyof PacienteForm) => (v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const filtered = pacientes.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf.includes(search) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Pacientes"
        subtitle={`${pacientes.length} cadastrado${pacientes.length !== 1 ? 's' : ''}`}
        action={<Button onClick={openCriar}>+ Novo paciente</Button>}
      />

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Buscar por nome, CPF ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: 320, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)',
            fontSize: 13.5, fontFamily: 'DM Sans, sans-serif', outline: 'none',
          }}
        />
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? <Empty message="Nenhum paciente encontrado." /> : (
        <Card style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Nome', 'CPF', 'Email', 'Telefone', 'Nascimento', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: 11.5, color: 'var(--muted)', fontWeight: 500, letterSpacing: '.05em',
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background .12s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 500 }}>{p.nome}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)', fontFamily: 'DM Mono' }}>
                    {formatCpf(p.cpf)}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)' }}>{p.email}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)' }}>{p.telefone || '—'}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {formatDate(p.dataNascimento)}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="ghost" onClick={() => openEditar(p)}>Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>Remover</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {modal && (
        <Modal title={modal === 'criar' ? 'Novo paciente' : 'Editar paciente'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Nome completo" value={form.nome} onChange={f('nome')} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Email" value={form.email} onChange={f('email')} type="email" required />
              <Input label="Senha" value={form.senha} onChange={f('senha')} type="password"
                placeholder={modal === 'editar' ? 'Deixe em branco para manter' : ''} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="CPF" value={form.cpf} onChange={f('cpf')} placeholder="00000000000" required />
              <Input label="Telefone" value={form.telefone} onChange={f('telefone')} placeholder="00000000000" />
            </div>
            <Input label="Endereço" value={form.endereco} onChange={f('endereco')} />
            <Input label="Data de nascimento" value={form.dataNascimento} onChange={f('dataNascimento')} type="date" required />
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
