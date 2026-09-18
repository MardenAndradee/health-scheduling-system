import { maskCep, maskCpf, maskTelefone } from '@/lib/utils'
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
    case 'numero':
      return typeof valor === 'number' && valor > 0
        ? `${valor}${pergunta.unidade ? ` ${pergunta.unidade}` : ''}`
        : 'Não informado'
    case 'selecao': {
      const opcao = pergunta.opcoes.find(o => o.id === valor)
      return opcao?.label ?? pergunta.opcoes[0]?.label ?? '—'
    }
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
 * Monta o texto de `observacoes` enviado para o backend — que não tem
 * colunas próprias para identificação/especialidade/respostas, então tudo
 * isso vira texto legível, seguindo o mesmo princípio que
 * `formatarResumoTriagem` já usava. O nível de urgência calculado pelo
 * backend não entra aqui (o backend não devolve o "porquê" do cálculo,
 * só o resultado em `Anamnese.nivelUrgencia`, já visível na fila).
 */
export function formatarResumoAnamnese(
  identificacao: IdentificacaoForm,
  especialidade: Especialidade,
  respostas: RespostasEspecialidade,
): string {
  const blocos: string[] = []

  blocos.push(`Tipo de atendimento: ${especialidade.nome}`)
  blocos.push(linhaIdentificacao(identificacao).join('\n'))

  const linhasAnamnese = [`Anamnese — ${especialidade.nome}`]
  for (const pergunta of especialidade.perguntas) {
    linhasAnamnese.push(` - ${pergunta.texto} ${formatarValorPergunta(pergunta, respostas[pergunta.id])}`)
  }
  blocos.push(linhasAnamnese.join('\n'))

  return blocos.join('\n\n')
}

export function formatarQueixa(especialidade: Especialidade, queixaPrincipal: string): string {
  return `[${especialidade.nome}] ${queixaPrincipal}`
}
