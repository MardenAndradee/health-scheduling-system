import { RespostasEspecialidade } from '@/lib/especialidades/tipos'

// ─── Enums ────────────────────────────────────────────────────────────────────

export type TipoUsuario = 'ADMIN' | 'PACIENTE' | 'PROFISSIONAL'

export type NivelUrgencia = 'VERDE' | 'AZUL' | 'AMARELO' | 'LARANJA' | 'VERMELHO'

export type StatusAgendamento =
  | 'AGENDADO'
  | 'CONFIRMADO'
  | 'EM_ATENDIMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO'
  | 'FALTOU'

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Usuario {
  id: number
  nome: string
  email: string
  tipoUsuario: TipoUsuario
}

export interface Paciente extends Usuario {
  cpf: string
  telefone?: string
  endereco?: string
  dataNascimento: string
}

export interface Profissional extends Usuario {
  especialidade: string
  crm?: string
  cargo?: string
}

export interface Anamnese {
  id: number
  sintomas: string
  observacoes?: string
  nivelUrgencia: NivelUrgencia
  dataRegistro: string
  paciente: Paciente
}

export interface Agendamento {
  id: number
  dataConsulta: string
  status: StatusAgendamento
  observacoes?: string
  paciente: Paciente
  profissional: Profissional
  anamnese?: Anamnese | null
}

export interface Consulta {
  id: number
  diagnostico?: string
  prescricao?: string
  dataConsulta: string
  observacoes?: string
  paciente: Paciente
  profissional: Profissional
}

// ─── DTOs de formulário ───────────────────────────────────────────────────────

export interface PacienteForm {
  nome: string
  email: string
  senha: string
  cpf: string
  telefone: string
  endereco: string
  dataNascimento: string
}

export interface ProfissionalForm {
  nome: string
  email: string
  senha: string
  especialidade: string
  crm: string
  cargo: string
}

export interface AnamneseForm {
  sintomas: string
  observacoes: string
  // Obrigatório só no fluxo manual do profissional; no wizard do paciente,
  // quem define é o backend a partir de especialidadeId/idade/respostas.
  nivelUrgencia?: NivelUrgencia
  pacienteId: number
  especialidadeId?: string
  idade?: number
  respostas?: RespostasEspecialidade
}

export interface AgendamentoForm {
  dataConsulta: string
  status: StatusAgendamento
  observacoes: string
  pacienteId: number
  profissionalId: number
  anamneseId?: number
}

export interface ConsultaForm {
  diagnostico: string
  prescricao: string
  dataConsulta: string
  observacoes: string
  pacienteId: number
  profissionalId: number
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiError {
  mensagem: string
  erro: string
  status: number
}

// ─── Autenticação ─────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  tipo: string
  id: number
  nome: string
  email: string
  tipoUsuario: TipoUsuario
}

export interface SessaoUsuario {
  id: number
  nome: string
  email: string
  tipoUsuario: TipoUsuario
}
