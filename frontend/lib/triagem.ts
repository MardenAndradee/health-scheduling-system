import { NivelUrgencia } from '@/types'

export type DuracaoSintomas = 'menos_1h' | 'horas' | 'dias' | 'semana_ou_mais'

export const duracaoOpcoes: { value: DuracaoSintomas; label: string }[] = [
  { value: 'menos_1h', label: 'Começou há menos de 1 hora' },
  { value: 'horas', label: 'Há algumas horas' },
  { value: 'dias', label: 'Há alguns dias' },
  { value: 'semana_ou_mais', label: 'Há uma semana ou mais' },
]

export const comorbidadeOpcoes = [
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hipertensao', label: 'Pressão alta (hipertensão)' },
  { value: 'gestante', label: 'Gestante' },
  { value: 'cardiopatia', label: 'Problema no coração' },
]

export const dorOpcoes = Array.from({ length: 11 }, (_, i) => {
  const rotulo =
    i === 0 ? 'Sem dor' :
    i <= 3 ? 'Dor leve' :
    i <= 6 ? 'Dor moderada' :
    i <= 8 ? 'Dor forte' : 'Dor insuportável'
  return { value: String(i), label: `${i} — ${rotulo}` }
})

export interface RespostasTriagem {
  idade: number
  comorbidades: string[]
  sintomas: string
  duracaoSintomas: DuracaoSintomas
  dorIntensidade: number
  faltaAr: boolean
  febre: boolean
  sangramento: boolean
}

/**
 * Cálculo provisório de urgência, feito no frontend enquanto o backend não tem
 * essa regra. É uma pontuação simples por fator de risco, não uma classificação
 * clínica validada — a secretária confirma ou ajusta o nível na fila de triagem.
 * Isolado neste arquivo para ser fácil de remover quando o backend assumir o
 * cálculo (ver docs/plannings/base-frontend-auth-e-areas.md).
 */
export function calcularNivelUrgencia(respostas: RespostasTriagem): NivelUrgencia {
  let pontos = respostas.dorIntensidade
  if (respostas.faltaAr) pontos += 8
  if (respostas.sangramento) pontos += 8
  if (respostas.febre) pontos += 3
  if (respostas.idade < 2 || respostas.idade > 70) pontos += 3
  pontos += respostas.comorbidades.length * 2
  if (respostas.duracaoSintomas === 'menos_1h') pontos += 2

  if (pontos >= 16) return 'VERMELHO'
  if (pontos >= 11) return 'LARANJA'
  if (pontos >= 6) return 'AMARELO'
  if (pontos >= 3) return 'AZUL'
  return 'VERDE'
}

function rotuloComorbidade(valor: string): string {
  return comorbidadeOpcoes.find(o => o.value === valor)?.label || valor
}

function rotuloDuracao(valor: DuracaoSintomas): string {
  return duracaoOpcoes.find(o => o.value === valor)?.label || valor
}

/**
 * Resume as respostas estruturadas em texto legível para o campo `observacoes`
 * da anamnese — o backend ainda não tem colunas próprias para elas.
 */
export function formatarResumoTriagem(respostas: RespostasTriagem): string {
  const partes: string[] = [`Idade: ${respostas.idade} anos`]

  if (respostas.comorbidades.length > 0) {
    partes.push(`Condições prévias: ${respostas.comorbidades.map(rotuloComorbidade).join(', ')}`)
  }

  partes.push(`Duração dos sintomas: ${rotuloDuracao(respostas.duracaoSintomas)}`)
  partes.push(`Intensidade da dor (0-10): ${respostas.dorIntensidade}`)

  const alertas = [
    respostas.faltaAr && 'falta de ar',
    respostas.febre && 'febre',
    respostas.sangramento && 'sangramento',
  ].filter((v): v is string => Boolean(v))

  partes.push(alertas.length > 0 ? `Sinais de alerta: ${alertas.join(', ')}` : 'Sem sinais de alerta relatados')

  return partes.join(' · ')
}
