'use client'

import { useEffect, useState } from 'react'
import { profissionaisApi } from '@/lib/api'
import { Profissional, ProfissionalForm } from '@/types'
import { PageHeader, Card, Button, Input, Modal, Empty, Loading, Toast } from '@/components/ui'

const empty: ProfissionalForm = { nome: '', email: '', senha: '', especialidade: '', crm: '', cargo: '' }

export default function ProfissionaisPage() {
  const [lista, setLista] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'criar' | 'editar' | null>(null)
  const [selected, setSelected] = useState<Profissional | null>(null)
  const [form, setForm] = useState<ProfissionalForm>(empty)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = () => {
    setLoading(true)
    profissionaisApi.listar().then(setLista).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCriar = () => { setForm(empty); setModal('criar') }
  const openEditar = (p: Profissional) => {
    setSelected(p)
    setForm({ nome: p.nome, email: p.email, senha: '', especialidade: p.especialidade, crm: p.crm || '', cargo: p.cargo || '' })
    setModal('editar')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal === 'criar') await profissionaisApi.criar(form)
      else if (selected) await profissionaisApi.atualizar(selected.id, form)
      showToast('Salvo com sucesso!', 'success')
      setModal(null)
      load()
    } catch (e: any) {
      showToast(e.message, 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover profissional?')) return
    try {
      await profissionaisApi.deletar(id)
      showToast('Profissional removido.', 'success')
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  const f = (k: keyof ProfissionalForm) => (v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const filtered = lista.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.especialidade.toLowerCase().includes(search.toLowerCase()) ||
    (p.crm || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Profissionais"
        subtitle={`${lista.length} cadastrado${lista.length !== 1 ? 's' : ''}`}
        action={<Button onClick={openCriar}>+ Novo profissional</Button>}
      />

      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Buscar por nome, especialidade ou CRM..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: 340, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)',
            fontSize: 13.5, fontFamily: 'DM Sans, sans-serif', outline: 'none',
          }}
        />
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? <Empty message="Nenhum profissional encontrado." /> : (
        <Card style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Nome', 'Especialidade', 'CRM', 'Cargo', 'Email', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: 11.5, color: 'var(--muted)', fontWeight: 500, letterSpacing: '.05em',
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 500 }}>{p.nome}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--accent)' }}>{p.especialidade}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)', fontFamily: 'DM Mono' }}>{p.crm || '—'}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)' }}>{p.cargo || '—'}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)' }}>{p.email}</td>
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
        <Modal title={modal === 'criar' ? 'Novo profissional' : 'Editar profissional'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Nome completo" value={form.nome} onChange={f('nome')} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Email" value={form.email} onChange={f('email')} type="email" required />
              <Input label="Senha" value={form.senha} onChange={f('senha')} type="password"
                placeholder={modal === 'editar' ? 'Deixe em branco para manter' : ''} />
            </div>
            <Input label="Especialidade" value={form.especialidade} onChange={f('especialidade')} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="CRM" value={form.crm} onChange={f('crm')} placeholder="CRM000000" />
              <Input label="Cargo" value={form.cargo} onChange={f('cargo')} placeholder="Ex: Médico Clínico" />
            </div>
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
