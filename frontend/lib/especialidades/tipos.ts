import type { LucideIcon } from 'lucide-react'

export type EspecialidadeId = 'clinico_geral' | 'enfermagem' | 'odontologia' | 'psicologia' | 'nutricao'

export type TipoResposta = 'sim_nao' | 'escala_0_10' | 'checkbox_multiplo' | 'texto_livre'

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

export interface PerguntaCheckbox extends PerguntaBase {
  tipo: 'checkbox_multiplo'
  opcoes: { id: string; label: string }[]
}

export interface PerguntaTexto extends PerguntaBase {
  tipo: 'texto_livre'
  placeholder?: string
}

export type Pergunta = PerguntaSimNao | PerguntaEscala | PerguntaCheckbox | PerguntaTexto

export interface GrupoPerguntas {
  id: string
  titulo: string
  pesoMin: number
  pesoMax: number
  perguntas: Pergunta[]
}

export interface Especialidade {
  id: EspecialidadeId
  nome: string
  descricaoCurta: string
  icone: LucideIcon
  grupos: GrupoPerguntas[]
}

/** grupoId -> perguntaId -> valor respondido */
export type RespostaValor = boolean | number | string[] | string
export type RespostasGrupo = Record<string, RespostaValor>
export type RespostasEspecialidade = Record<string, RespostasGrupo>

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
    case 'checkbox_multiplo': return []
    case 'texto_livre': return ''
  }
}
