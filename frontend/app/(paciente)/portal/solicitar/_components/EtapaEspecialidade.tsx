'use client'

import { especialidades } from '@/lib/especialidades/config'
import { EspecialidadeId } from '@/lib/especialidades/tipos'
import { SelecaoCard } from '@/components/ui'

export function EtapaEspecialidade({ selecionada, onSelecionar }: {
  selecionada: EspecialidadeId | null
  onSelecionar: (id: EspecialidadeId) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Que tipo de atendimento você precisa?</div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
          Escolha a opção mais próxima do seu motivo de consulta.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {especialidades.map(e => (
          <SelecaoCard
            key={e.id}
            icone={e.icone}
            titulo={e.nome}
            descricao={e.descricaoCurta}
            selecionado={selecionada === e.id}
            onClick={() => onSelecionar(e.id)}
          />
        ))}
      </div>
    </div>
  )
}
