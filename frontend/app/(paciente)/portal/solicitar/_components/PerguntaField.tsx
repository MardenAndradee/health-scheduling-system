'use client'

import { Input, Select, ToggleSimNao } from '@/components/ui'
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
    case 'numero':
      return (
        <Input
          label={pergunta.unidade ? `${pergunta.texto} (${pergunta.unidade})` : pergunta.texto}
          value={typeof valor === 'number' && valor > 0 ? String(valor) : ''}
          onChange={v => onChange(v === '' ? 0 : Number(v))}
          type="number"
          placeholder={pergunta.placeholder}
        />
      )
    case 'selecao':
      return (
        <Select
          label={pergunta.texto}
          value={typeof valor === 'string' && valor ? valor : pergunta.opcoes[0]?.id ?? ''}
          onChange={onChange}
          options={pergunta.opcoes.map(o => ({ value: o.id, label: o.label }))}
        />
      )
  }
}
