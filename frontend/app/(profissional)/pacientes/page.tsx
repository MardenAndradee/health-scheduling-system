'use client'

import { useEffect, useState } from 'react'
import { pacientesApi } from '@/lib/api'
import { Paciente, PacienteForm } from '@/types'
import {
  PageHeader, Card, Button, Input, Modal, Empty, Loading, Toast,
} from '@/components/ui'
import { EnderecoFields, EnderecoValor, enderecoVazio } from '@/components/forms/EnderecoFields'
import { apenasDigitos, formatDate, formatarEnderecoCompleto, maskCpf, maskTelefone, mensagemErro } from '@/lib/utils'

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
  const [endereco, setEndereco] = useState<EnderecoValor>(enderecoVazio)
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

  const openCriar = () => { setForm(empty); setEndereco(enderecoVazio); setModal('criar') }
  const openEditar = (p: Paciente) => {
    setSelected(p)
    setForm({
      nome: p.nome, email: p.email, senha: '',
      cpf: p.cpf, telefone: p.telefone || '',
      endereco: p.endereco || '',
      dataNascimento: p.dataNascimento,
    })
    // O endereço já cadastrado é uma única string opaca (cadastros antigos ou
    // sem CEP estruturado) — cai como ponto de partida no campo "Endereço" e
    // os demais campos ficam em branco, editáveis (ex.: buscando o CEP de novo).
    setEndereco({ ...enderecoVazio, endereco: p.endereco || '' })
    setModal('editar')
  }

  const setCampoEndereco = <K extends keyof EnderecoValor>(campo: K) => (valor: EnderecoValor[K]) =>
    setEndereco(prev => ({ ...prev, [campo]: valor }))

  const handleSave = async () => {
    setSaving(true)
    const dados = { ...form, endereco: formatarEnderecoCompleto(endereco) }
    try {
      if (modal === 'criar') {
        await pacientesApi.criar(dados)
        showToast('Paciente cadastrado com sucesso!', 'success')
      } else if (selected) {
        await pacientesApi.atualizar(selected.id, dados)
        showToast('Paciente atualizado!', 'success')
      }
      setModal(null)
      load()
    } catch (e) {
      showToast(mensagemErro(e), 'error')
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
    } catch (e) {
      showToast(mensagemErro(e), 'error')
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
            width: '100%', maxWidth: 320, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)',
            fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none',
          }}
        />
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? <Empty message="Nenhum paciente encontrado." /> : (
        <Card style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                {['Nome', 'CPF', 'Email', 'Telefone', 'Nascimento', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap',
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
                  <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap' }}>{p.nome}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {maskCpf(p.cpf)}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{p.email}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {p.telefone ? maskTelefone(p.telefone) : '—'}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
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
            {modal === 'criar' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Email" value={form.email} onChange={f('email')} type="email" required />
                <Input label="Senha" value={form.senha} onChange={f('senha')} type="password" required />
              </div>
            ) : (
              <Input label="Email" value={form.email} onChange={f('email')} type="email" required />
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="CPF" value={maskCpf(form.cpf)}
                onChange={v => f('cpf')(apenasDigitos(v).slice(0, 11))}
                placeholder="000.000.000-00" required
              />
              <Input
                label="Telefone" value={maskTelefone(form.telefone)}
                onChange={v => f('telefone')(apenasDigitos(v).slice(0, 11))}
                placeholder="(00) 00000-0000"
              />
            </div>
            <EnderecoFields valor={endereco} onChange={setCampoEndereco} />
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
