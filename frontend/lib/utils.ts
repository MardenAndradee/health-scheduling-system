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

export function apenasDigitos(value: string): string {
  return value.replace(/\D/g, '')
}

/** Formata progressivamente enquanto o usuário digita (000.000.000-00) e também serve para exibir um CPF já completo. */
export function maskCpf(value: string): string {
  return apenasDigitos(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

/** 00000-000, formatado progressivamente enquanto o usuário digita. */
export function maskCep(value: string): string {
  return apenasDigitos(value)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2')
}

/** (DD) 00000-0000 para celular ou (DD) 0000-0000 para fixo, conforme a quantidade de dígitos digitados. */
export function maskTelefone(value: string): string {
  const digitos = apenasDigitos(value).slice(0, 11)
  if (digitos.length > 10) {
    return digitos
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
  }
  return digitos
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

/** Junta os pedaços de um endereço estruturado numa única string legível — o backend só tem uma coluna de texto para endereço. */
export function formatarEnderecoCompleto(valor: {
  endereco: string; bairro: string; cidade: string; estado: string; cep: string
}): string {
  return [
    valor.endereco,
    valor.bairro,
    valor.cidade && valor.estado ? `${valor.cidade}/${valor.estado}` : valor.cidade,
    valor.cep ? `CEP ${maskCep(valor.cep)}` : '',
  ].filter(Boolean).join(' - ')
}

export function mensagemErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Erro desconhecido'
}

// Paleta de classificação de risco — uso exclusivo para NivelUrgencia. Nunca
// reaproveitar nenhuma destas cinco cores em outro contexto da UI (erro de
// formulário, status de agendamento etc.), para não confundir gravidade
// clínica com feedback de sistema. Ver docs/08-design.md.
export const urgenciaConfig: Record<NivelUrgencia, { label: string; color: string; bg: string }> = {
  VERMELHO: { label: 'Emergência',    color: '#DC2626', bg: '#FEE2E2' },
  LARANJA:  { label: 'Muito urgente', color: '#F97316', bg: '#FFEDD5' },
  AMARELO:  { label: 'Urgente',       color: '#EAB308', bg: '#FEF9C3' },
  AZUL:     { label: 'Pouco urgente', color: '#3B82F6', bg: '#DBEAFE' },
  VERDE:    { label: 'Não urgente',   color: '#22C55E', bg: '#DCFCE7' },
}

// Cores próprias de status de agendamento — deliberadamente distintas das
// cinco cores de risco acima (nenhum hex em comum), para que uma cor nunca
// signifique gravidade clínica num contexto e outra coisa em outro.
export const statusConfig: Record<StatusAgendamento, { label: string; color: string }> = {
  AGENDADO:       { label: 'Agendado',       color: '#2563EB' },
  CONFIRMADO:     { label: 'Confirmado',     color: '#0D9488' },
  EM_ATENDIMENTO: { label: 'Em atendimento', color: '#7C3AED' },
  CONCLUIDO:      { label: 'Concluído',      color: '#64748B' },
  CANCELADO:      { label: 'Cancelado',      color: '#E11D48' },
  FALTOU:         { label: 'Faltou',         color: '#92400E' },
}

export const statusDescricaoPaciente: Record<StatusAgendamento, string> = {
  AGENDADO: 'Sua consulta foi agendada.',
  CONFIRMADO: 'Sua consulta está confirmada.',
  EM_ATENDIMENTO: 'Você está em atendimento agora.',
  CONCLUIDO: 'Este atendimento foi concluído.',
  CANCELADO: 'Este agendamento foi cancelado.',
  FALTOU: 'Consta que você não compareceu a este agendamento.',
}
