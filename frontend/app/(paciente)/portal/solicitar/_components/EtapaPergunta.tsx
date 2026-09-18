'use client'

import { Pergunta, RespostaValor } from '@/lib/especialidades/tipos'
import { PerguntaField } from './PerguntaField'

export function EtapaPergunta({ pergunta, numero, total, valor, onChange }: {
  pergunta: Pergunta
  numero: number
  total: number
  valor: RespostaValor
  onChange: (valor: RespostaValor) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.05em' }}>
        PERGUNTA {numero} DE {total}
      </div>
      <PerguntaField pergunta={pergunta} valor={valor} onChange={onChange} />
    </div>
  )
}
