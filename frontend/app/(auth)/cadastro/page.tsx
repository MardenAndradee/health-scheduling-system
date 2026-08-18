'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button, Input } from '@/components/ui'
import { PacienteForm } from '@/types'
import { apenasDigitos, maskCpf, maskTelefone, mensagemErro } from '@/lib/utils'

const vazio: PacienteForm = {
  nome: '', email: '', senha: '', cpf: '', telefone: '', endereco: '', dataNascimento: '',
}

export default function CadastroPage() {
  const { registrar } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<PacienteForm>(vazio)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const f = (k: keyof PacienteForm) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await registrar(form)
      router.replace('/portal/inicio')
    } catch (err) {
      setErro(mensagemErro(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>Criar conta de paciente</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Leva menos de um minuto</p>
      </div>

      <Input label="Nome completo" value={form.nome} onChange={f('nome')} required />
      <Input label="Email" value={form.email} onChange={f('email')} type="email" required />
      <Input label="Senha" value={form.senha} onChange={f('senha')} type="password" required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input
          label="CPF" value={maskCpf(form.cpf || '')}
          onChange={v => f('cpf')(apenasDigitos(v).slice(0, 11))}
          placeholder="000.000.000-00" required
        />
        <Input
          label="Telefone" value={maskTelefone(form.telefone || '')}
          onChange={v => f('telefone')(apenasDigitos(v).slice(0, 11))}
          placeholder="(00) 00000-0000"
        />
      </div>
      <Input label="Endereço" value={form.endereco || ''} onChange={f('endereco')} />
      <Input label="Data de nascimento" value={form.dataNascimento || ''} onChange={f('dataNascimento')} type="date" required />

      {erro && (
        <p style={{
          fontSize: 13, color: 'var(--danger)', background: 'var(--danger-soft)',
          padding: '10px 13px', borderRadius: 'var(--radius)', border: '1px solid #FECDD3',
        }}>
          {erro}
        </p>
      )}

      <Button type="submit" disabled={enviando} style={{ justifyContent: 'center' }}>
        {enviando ? 'Criando conta...' : 'Criar conta'}
      </Button>

      <p style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center' }}>
        Já tem conta? <Link href="/login" style={{ color: 'var(--accent)' }}>Entrar</Link>
      </p>
    </form>
  )
}
