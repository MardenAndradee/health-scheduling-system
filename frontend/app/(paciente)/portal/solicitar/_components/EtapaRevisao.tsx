'use client'

import { formatarValorPergunta } from '@/lib/especialidades/resumo'
import { Especialidade, IdentificacaoForm, RespostasEspecialidade } from '@/lib/especialidades/tipos'
import { maskCep, maskCpf, maskTelefone } from '@/lib/utils'

const rotuloSexo: Record<string, string> = { masculino: 'Masculino', feminino: 'Feminino' }
const rotuloCor: Record<string, string> = {
  branca: 'Branca', preta: 'Preta', parda: 'Parda', amarela: 'Amarela', indigena: 'Indígena',
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.05em' }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 13.5, marginTop: 2 }}>{valor || '—'}</div>
    </div>
  )
}

export function EtapaRevisao({ especialidade, identificacao, respostas }: {
  especialidade: Especialidade
  identificacao: IdentificacaoForm
  respostas: RespostasEspecialidade
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>Confira antes de enviar</div>

      <Campo label="Tipo de atendimento" valor={especialidade.nome} />
      <Campo label="Nome completo" valor={identificacao.nomeCompleto} />
      <Campo label="Idade" valor={`${identificacao.idade} anos`} />
      <Campo label="CPF" valor={maskCpf(identificacao.cpf)} />
      <Campo label="Celular" valor={maskTelefone(identificacao.celular)} />
      <Campo
        label="Endereço"
        valor={[identificacao.endereco, identificacao.bairro, identificacao.cidade && `${identificacao.cidade}/${identificacao.estado}`]
          .filter(Boolean).join(' - ')}
      />
      <Campo label="CEP" valor={identificacao.cep ? maskCep(identificacao.cep) : ''} />
      <Campo label="Cor/Raça" valor={rotuloCor[identificacao.cor] || ''} />
      <Campo label="Sexo" valor={rotuloSexo[identificacao.sexo] || ''} />
      <Campo label="Queixa principal" valor={identificacao.queixaPrincipal} />

      {especialidade.grupos.map(grupo => (
        <div key={grupo.id}>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.05em', marginBottom: 6 }}>
            {grupo.titulo.toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {grupo.perguntas.map(pergunta => (
              <div key={pergunta.id} style={{ fontSize: 13, lineHeight: 1.5 }}>
                {pergunta.texto} <strong>{formatarValorPergunta(pergunta, respostas[grupo.id]?.[pergunta.id])}</strong>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
