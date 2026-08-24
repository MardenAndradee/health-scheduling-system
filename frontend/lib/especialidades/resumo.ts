import { NivelUrgencia } from '@/types'
import { urgenciaConfig, maskCep, maskCpf, maskTelefone } from '@/lib/utils'
import { Especialidade, IdentificacaoForm, Pergunta, RespostasEspecialidade, RespostaValor } from './tipos'

const rotuloSexo: Record<string, string> = { masculino: 'Masculino', feminino: 'Feminino' }
const rotuloCor: Record<string, string> = {
  branca: 'Branca', preta: 'Preta', parda: 'Parda', amarela: 'Amarela', indigena: 'Indígena',
}

export function formatarValorPergunta(pergunta: Pergunta, valor: RespostaValor | undefined): string {
  switch (pergunta.tipo) {
    case 'sim_nao':
      return valor === true ? 'Sim' : 'Não'
    case 'escala_0_10':
      return typeof valor === 'number' ? String(valor) : '0'
    case 'checkbox_multiplo': {
      const selecionados = Array.isArray(valor) ? valor : []
      if (selecionados.length === 0) return 'Nenhum'
      return pergunta.opcoes
        .filter(o => selecionados.includes(o.id))
        .map(o => o.label)
        .join(', ')
    }
    case 'texto_livre':
      return typeof valor === 'string' && valor.trim() ? valor : '—'
  }
}

function linhaIdentificacao(identificacao: IdentificacaoForm): string[] {
  const enderecoCompleto = [
    identificacao.endereco,
    identificacao.bairro,
    identificacao.cidade && identificacao.estado ? `${identificacao.cidade}/${identificacao.estado}` : identificacao.cidade,
    identificacao.cep ? `CEP ${maskCep(identificacao.cep)}` : '',
  ].filter(Boolean).join(' - ')

  const linhas = [
    'Identificação',
    `Nome completo: ${identificacao.nomeCompleto}`,
    `Idade: ${identificacao.idade} anos`,
    `Sexo: ${rotuloSexo[identificacao.sexo] || '—'}`,
    `CPF: ${maskCpf(identificacao.cpf)}`,
  ]
  if (identificacao.naturalidade.trim()) linhas.push(`Naturalidade: ${identificacao.naturalidade}`)
  linhas.push(`Cor/Raça: ${rotuloCor[identificacao.cor] || '—'}`)
  linhas.push(`Endereço: ${enderecoCompleto || '—'}`)
  linhas.push(`Celular: ${maskTelefone(identificacao.celular)}`)
  return linhas
}

/**
 * Monta o texto de `observacoes` enviado para o backend — que não tem colunas
 * próprias para identificação/especialidade/respostas, então tudo isso vira
 * texto legível, seguindo o mesmo princípio que `formatarResumoTriagem` já
 * usava. Genérico sobre a config: os rótulos vêm de `Pergunta.texto` e
 * `opcoes[].label`, então editar `config.ts` nunca exige mexer aqui.
 */
export function formatarResumoAnamnese(
  identificacao: IdentificacaoForm,
  especialidade: Especialidade,
  respostas: RespostasEspecialidade,
  nivelCalculado: NivelUrgencia,
): string {
  const blocos: string[] = []

  blocos.push(`Tipo de atendimento: ${especialidade.nome}`)
  blocos.push(linhaIdentificacao(identificacao).join('\n'))

  const linhasAnamnese = [`Anamnese — ${especialidade.nome}`]
  for (const grupo of especialidade.grupos) {
    linhasAnamnese.push(`${grupo.titulo} (peso ${grupo.pesoMin}-${grupo.pesoMax})`)
    for (const pergunta of grupo.perguntas) {
      const valor = respostas[grupo.id]?.[pergunta.id]
      linhasAnamnese.push(` - ${pergunta.texto} ${formatarValorPergunta(pergunta, valor)}`)
    }
  }
  blocos.push(linhasAnamnese.join('\n'))

  blocos.push(
    `Nível de urgência calculado automaticamente (provisório): ${urgenciaConfig[nivelCalculado].label.toUpperCase()} — sujeito a confirmação da equipe.`
  )

  return blocos.join('\n\n')
}

export function formatarQueixa(especialidade: Especialidade, queixaPrincipal: string): string {
  return `[${especialidade.nome}] ${queixaPrincipal}`
}
