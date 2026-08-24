'use client'

import { GrupoPerguntas, RespostasGrupo, RespostaValor, valorPadraoPergunta } from '@/lib/especialidades/tipos'
import { PerguntaField } from './PerguntaField'

export function EtapaGrupoPerguntas({ grupo, respostas, onChange }: {
  grupo: GrupoPerguntas
  respostas: RespostasGrupo
  onChange: (perguntaId: string, valor: RespostaValor) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{grupo.titulo}</div>

      {grupo.perguntas.map(pergunta => (
        <PerguntaField
          key={pergunta.id}
          pergunta={pergunta}
          valor={respostas[pergunta.id] ?? valorPadraoPergunta(pergunta)}
          onChange={v => onChange(pergunta.id, v)}
        />
      ))}
    </div>
  )
}
