'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Input } from '@/components/ui'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>Recuperar senha</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
          Informe seu email para receber as instruções.
        </p>
      </div>

      <Input label="Email" value={email} onChange={setEmail} type="email" />

      <p style={{
        fontSize: 12.5, color: 'var(--muted)', background: 'var(--surface2)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 12px',
      }}>
        Essa funcionalidade ainda não está disponível — em breve.
      </p>

      <Button disabled style={{ justifyContent: 'center' }}>Enviar instruções</Button>

      <p style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center' }}>
        <Link href="/login" style={{ color: 'var(--accent)' }}>Voltar ao login</Link>
      </p>
    </div>
  )
}
