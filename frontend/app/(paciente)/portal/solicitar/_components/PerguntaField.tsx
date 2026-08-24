'use client'

import { CheckboxGroup, Select, Textarea, ToggleSimNao } from '@/components/ui'
import { escalaDorOpcoes } from '@/lib/especialidades/pontuacao'
import { Pergunta, RespostaValor } from '@/lib/especialidades/tipos'

/**
 * Renderiza uma pergunta conforme `pergunta.tipo`. É o único lugar que
 * decide qual controle usar — editar/adicionar/remover pergunta em
 * lib/especialidades/config.ts nunca exige tocar neste componente.
 */
export function PerguntaField({ pergunta, valor, onChange }: {
  pergunta: Pergunta
  valor: RespostaValor
  onChange: (valor: RespostaValor) => void
}) {
  switch (pergunta.tipo) {
    case 'sim_nao':
      return (
        <ToggleSimNao
          label={pergunta.texto}
          value={typeof valor === 'boolean' ? valor : false}
          onChange={onChange}
        />
      )
    case 'escala_0_10':
      return (
        <Select
          label={pergunta.texto}
          value={String(typeof valor === 'number' ? valor : 0)}
          onChange={v => onChange(Number(v))}
          options={escalaDorOpcoes}
        />
      )
    case 'checkbox_multiplo':
      return (
        <CheckboxGroup
          label={pergunta.texto}
          opcoes={pergunta.opcoes}
          selecionados={Array.isArray(valor) ? valor : []}
          onChange={onChange}
        />
      )
    case 'texto_livre':
      return (
        <Textarea
          label={pergunta.texto}
          value={typeof valor === 'string' ? valor : ''}
          onChange={onChange}
          placeholder={pergunta.placeholder}
          rows={2}
        />
      )
  }
}
