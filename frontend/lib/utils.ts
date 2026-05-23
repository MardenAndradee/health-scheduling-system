import { NivelUrgencia, StatusAgendamento } from '@/types'

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatCpf(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export const urgenciaConfig: Record<NivelUrgencia, { label: string; color: string; bg: string }> = {
  VERMELHO: { label: 'Emergência',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  LARANJA:  { label: 'Muito urgente', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  AMARELO:  { label: 'Urgente',       color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  AZUL:     { label: 'Pouco urgente', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  VERDE:    { label: 'Não urgente',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
}

export const statusConfig: Record<StatusAgendamento, { label: string; color: string }> = {
  AGENDADO:       { label: 'Agendado',       color: '#3b82f6' },
  CONFIRMADO:     { label: 'Confirmado',     color: '#22c55e' },
  EM_ATENDIMENTO: { label: 'Em atendimento', color: '#f97316' },
  CONCLUIDO:      { label: 'Concluído',      color: '#6b7280' },
  CANCELADO:      { label: 'Cancelado',      color: '#ef4444' },
  FALTOU:         { label: 'Faltou',         color: '#a855f7' },
}
