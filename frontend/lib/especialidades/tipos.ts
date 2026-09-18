import type { LucideIcon } from 'lucide-react'

export type EspecialidadeId = 'clinico_geral' | 'enfermagem' | 'odontologia' | 'psicologia' | 'nutricao'

export type TipoResposta = 'sim_nao' | 'escala_0_10' | 'numero' | 'selecao'

interface PerguntaBase {
  id: string
  texto: string
}

export interface PerguntaSimNao extends PerguntaBase {
  tipo: 'sim_nao'
}

export interface PerguntaEscala extends PerguntaBase {
  tipo: 'escala_0_10'
}

export interface PerguntaNumero extends PerguntaBase {
  tipo: 'numero'
  unidade?: string
  placeholder?: string
}

export interface PerguntaSelecao extends PerguntaBase {
  tipo: 'selecao'
  opcoes: { id: string; label: string }[]
}

export type Pergunta = PerguntaSimNao | PerguntaEscala | PerguntaNumero | PerguntaSelecao

export interface Especialidade {
  id: EspecialidadeId
  nome: string
  descricaoCurta: string
  icone: LucideIcon
  perguntas: Pergunta[]
}

/**
 * perguntaId -> valor respondido. O peso/cálculo de urgência de cada
 * resposta não vive aqui nem em nenhum lugar do frontend — o backend
 * (AnamneseService) recalcula por conta própria a partir do
 * especialidadeId + idade + respostas, é a única fonte de verdade pro
 * nível de urgência. O frontend só sabe o suficiente pra desenhar a
 * pergunta certa e serializar a resposta.
 */
export type RespostaValor = boolean | number | string
export type RespostasEspecialidade = Record<string, RespostaValor>

export interface IdentificacaoForm {
  nomeCompleto: string
  idade: string
  sexo: 'masculino' | 'feminino' | ''
  cpf: string
  naturalidade: string
  cor: 'branca' | 'preta' | 'parda' | 'amarela' | 'indigena' | ''
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  celular: string
  queixaPrincipal: string
}

export const identificacaoVazia: IdentificacaoForm = {
  nomeCompleto: '', idade: '', sexo: '', cpf: '', naturalidade: '', cor: '',
  endereco: '', bairro: '', cidade: '', estado: '', cep: '', celular: '', queixaPrincipal: '',
}

export function valorPadraoPergunta(pergunta: Pergunta): RespostaValor {
  switch (pergunta.tipo) {
    case 'sim_nao': return false
    case 'escala_0_10': return 0
    case 'numero': return 0
    case 'selecao': return pergunta.opcoes[0]?.id ?? ''
  }
}
