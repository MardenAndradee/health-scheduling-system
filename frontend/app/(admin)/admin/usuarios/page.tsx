'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { usuariosApi } from '@/lib/api'
import { TipoUsuario, Usuario } from '@/types'
import {
  PageHeader, Card, Button, Input, Modal, Empty, Loading, Toast,
} from '@/components/ui'
import { mensagemErro } from '@/lib/utils'

const tipoLabel: Record<TipoUsuario, string> = {
  ADMIN: 'Administrador',
  PROFISSIONAL: 'Profissional',
  PACIENTE: 'Paciente',
}

// Cores distintas das cinco reservadas para NivelUrgencia (ver lib/utils.ts)
const tipoCor: Record<TipoUsuario, string> = {
  ADMIN: '#7C3AED',
  PROFISSIONAL: '#2563EB',
  PACIENTE: '#0D9488',
}

interface NovoAdminForm {
  nome: string
  email: string
  senha: string
}

const vazio: NovoAdminForm = { nome: '', email: '', senha: '' }

export default function UsuariosPage() {
  const { usuario: usuarioLogado } = useAuth()
  const [lista, setLista] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<TipoUsuario | ''>('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<NovoAdminForm>(vazio)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = () => {
    setLoading(true)
    usuariosApi.listar().then(setLista).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCriar = async () => {
    setSaving(true)
    try {
      await usuariosApi.criar({ ...form, tipoUsuario: 'ADMIN' })
      showToast('Administrador criado!', 'success')
      setModal(false)
      setForm(vazio)
      load()
    } catch (e) { showToast(mensagemErro(e), 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (u: Usuario) => {
    if (!confirm(`Remover a conta de ${u.nome}? Essa ação não pode ser desfeita.`)) return
    try {
      await usuariosApi.deletar(u.id)
      showToast('Usuário removido.', 'success')
      load()
    } catch (e) { showToast(mensagemErro(e), 'error') }
  }

  const filtrados = filtroTipo ? lista.filter(u => u.tipoUsuario === filtroTipo) : lista

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle={`${lista.length} conta${lista.length !== 1 ? 's' : ''} no sistema`}
        action={<Button onClick={() => setModal(true)}>+ Novo administrador</Button>}
      />

      <div style={{ marginBottom: 16 }}>
        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value as TipoUsuario | '')}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)',
            fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">Todos os tipos</option>
          <option value="ADMIN">Administradores</option>
          <option value="PROFISSIONAL">Profissionais</option>
          <option value="PACIENTE">Pacientes</option>
        </select>
      </div>

      {loading ? <Loading /> : filtrados.length === 0 ? <Empty message="Nenhum usuário encontrado." /> : (
        <Card style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                {['Nome', 'Email', 'Tipo', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap',
                    fontSize: 11.5, color: 'var(--muted)', fontWeight: 500, letterSpacing: '.05em',
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u, i) => {
                const souEu = u.id === usuarioLogado?.id
                return (
                  <tr key={u.id}
                    style={{ borderBottom: i < filtrados.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {u.nome}{souEu && <span style={{ color: 'var(--muted)', fontWeight: 400 }}> (você)</span>}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{u.email}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{
                        fontSize: 11.5, fontWeight: 500, color: tipoCor[u.tipoUsuario],
                        background: `${tipoCor[u.tipoUsuario]}1a`, padding: '3px 9px', borderRadius: 20,
                      }}>
                        {tipoLabel[u.tipoUsuario]}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="sm" variant="danger" disabled={souEu}
                          onClick={() => handleDelete(u)}
                          title={souEu ? 'Você não pode remover sua própria conta' : undefined}
                        >
                          Remover
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {modal && (
        <Modal title="Novo administrador" onClose={() => setModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Nome completo" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} required />
            <Input label="Email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} type="email" required />
            <Input label="Senha" value={form.senha} onChange={v => setForm(p => ({ ...p, senha: v }))} type="password" required />
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              Administradores têm acesso total ao sistema, incluindo gerenciar outros usuários.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <Button variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
              <Button onClick={handleCriar} disabled={saving || !form.nome || !form.email || !form.senha}>
                {saving ? 'Criando...' : 'Criar administrador'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
