import { NivelUrgencia } from '@/types'
import { Especialidade, Pergunta, RespostasEspecialidade, RespostaValor } from './tipos'

/**
 * Cálculo provisório e heurístico de urgência, rodando no cliente enquanto o
 * backend não tem a regra manual definitiva (ver docs/plannings/). NÃO é
 * lógica clínica real — serve só para popular a fila até a equipe assumir o
 * cálculo; o nível pode ser corrigido depois em "Editar", na fila de
 * triagem (frontend/app/(profissional)/anamneses/page.tsx).
 *
 * Genérico sobre a config: nunca faz `if (especialidade.id === ...)`, só lê
 * peso/tipo de cada pergunta — então continua funcionando sem alteração
 * quando as perguntas de `config.ts` mudarem.
 */

const BONUS_IDADE = 3
const IDADE_MIN_SEM_BONUS = 2
const IDADE_MAX_SEM_BONUS = 70

const LIMIAR_VERMELHO = 65
const LIMIAR_LARANJA = 45
const LIMIAR_AMARELO = 25
const LIMIAR_AZUL = 10

const PESO_MIN_ALARME = 8

function positividade(pergunta: Pergunta, valor: RespostaValor | undefined): number {
  switch (pergunta.tipo) {
    case 'sim_nao':
      return valor === true ? 1 : 0
    case 'escala_0_10':
      return typeof valor === 'number' ? Math.min(Math.max(valor, 0), 10) / 10 : 0
    case 'checkbox_multiplo': {
      const selecionados = Array.isArray(valor) ? valor.length : 0
      return pergunta.opcoes.length > 0 ? selecionados / pergunta.opcoes.length : 0
    }
    case 'texto_livre':
      return 0
  }
}

function fracaoGrupo(perguntas: Pergunta[], respostasGrupo: Record<string, RespostaValor> | undefined): number {
  if (perguntas.length === 0) return 0
  const soma = perguntas.reduce((acc, p) => acc + positividade(p, respostasGrupo?.[p.id]), 0)
  return soma / perguntas.length
}

export function calcularNivelUrgenciaEspecialidade(
  especialidade: Especialidade,
  respostas: RespostasEspecialidade,
  idade: number,
): NivelUrgencia {
  let pontosBrutos = 0
  let pontosMaximos = 0
  let pisoAlarme: NivelUrgencia | null = null

  for (const grupo of especialidade.grupos) {
    const fracao = fracaoGrupo(grupo.perguntas, respostas[grupo.id])
    const contribuicao = fracao > 0 ? grupo.pesoMin + fracao * (grupo.pesoMax - grupo.pesoMin) : 0

    pontosBrutos += contribuicao
    pontosMaximos += grupo.pesoMax

    if (grupo.pesoMin >= PESO_MIN_ALARME && fracao > 0) {
      pisoAlarme = fracao >= 0.5 ? 'VERMELHO' : 'LARANJA'
    }
  }

  if (idade < IDADE_MIN_SEM_BONUS || idade > IDADE_MAX_SEM_BONUS) {
    pontosBrutos += BONUS_IDADE
  }
  pontosMaximos += BONUS_IDADE

  const percentual = pontosMaximos > 0
    ? Math.min(Math.max((pontosBrutos / pontosMaximos) * 100, 0), 100)
    : 0

  let nivel: NivelUrgencia =
    percentual >= LIMIAR_VERMELHO ? 'VERMELHO' :
    percentual >= LIMIAR_LARANJA ? 'LARANJA' :
    percentual >= LIMIAR_AMARELO ? 'AMARELO' :
    percentual >= LIMIAR_AZUL ? 'AZUL' : 'VERDE'

  if (pisoAlarme === 'VERMELHO') nivel = 'VERMELHO'
  else if (pisoAlarme === 'LARANJA' && nivel !== 'VERMELHO') nivel = 'LARANJA'

  return nivel
}

export const escalaDorOpcoes = Array.from({ length: 11 }, (_, i) => {
  const rotulo =
    i === 0 ? 'Sem dor' :
    i <= 3 ? 'Dor leve' :
    i <= 6 ? 'Dor moderada' :
    i <= 8 ? 'Dor forte' : 'Dor insuportável'
  return { value: String(i), label: `${i} — ${rotulo}` }
})
