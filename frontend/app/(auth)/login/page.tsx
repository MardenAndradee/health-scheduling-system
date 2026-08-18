'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button, Input } from '@/components/ui'
import { rotaInicialPorPapel } from '@/lib/auth'
import { mensagemErro } from '@/lib/utils'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const sessao = await login({ email, senha })
      router.replace(rotaInicialPorPapel(sessao.tipoUsuario))
    } catch (err) {
      setErro(mensagemErro(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{
          width: 44, height: 44, background: 'var(--accent)', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 auto 12px',
        }}>+</div>
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>Entrar</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Sistema de Triagem — Posto de Saúde</p>
      </div>

      <Input label="Email" value={email} onChange={setEmail} type="email" required />
      <Input label="Senha" value={senha} onChange={setSenha} type="password" required />

      {erro && (
        <p style={{
          fontSize: 13, color: 'var(--danger)', background: 'var(--danger-soft)',
          padding: '10px 13px', borderRadius: 'var(--radius)', border: '1px solid #FECDD3',
        }}>
          {erro}
        </p>
      )}

      <Button type="submit" disabled={enviando} style={{ justifyContent: 'center' }}>
        {enviando ? 'Entrando...' : 'Entrar'}
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
        <Link href="/recuperar-senha" style={{ color: 'var(--muted)' }}>Esqueci minha senha</Link>
        <Link href="/cadastro" style={{ color: 'var(--accent)' }}>Criar conta</Link>
      </div>
    </form>
  )
}
