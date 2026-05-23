import {
  Agendamento, AgendamentoForm,
  Anamnese, AnamneseForm,
  Consulta, ConsultaForm,
  NivelUrgencia,
  Paciente, PacienteForm,
  Profissional, ProfissionalForm,
  StatusAgendamento,
  Usuario,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ mensagem: 'Erro desconhecido' }))
    throw new Error(err.mensagem || `Erro ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Usuários ─────────────────────────────────────────────────────────────────
export const usuariosApi = {
  listar: () => request<Usuario[]>('/usuarios'),
  buscarPorId: (id: number) => request<Usuario>(`/usuarios/${id}`),
  criar: (data: Omit<Usuario, 'id'> & { senha: string }) =>
    request<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id: number, data: Partial<Usuario> & { senha?: string }) =>
    request<Usuario>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletar: (id: number) => request<void>(`/usuarios/${id}`, { method: 'DELETE' }),
}

// ─── Pacientes ────────────────────────────────────────────────────────────────
export const pacientesApi = {
  listar: () => request<Paciente[]>('/pacientes'),
  buscarPorId: (id: number) => request<Paciente>(`/pacientes/${id}`),
  buscarPorCpf: (cpf: string) => request<Paciente>(`/pacientes/cpf/${cpf}`),
  buscarPorNome: (nome: string) => request<Paciente[]>(`/pacientes/nome/${nome}`),
  urgentes: () => request<Paciente[]>('/pacientes/urgentes'),
  criar: (data: PacienteForm) =>
    request<Paciente>('/pacientes', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id: number, data: PacienteForm) =>
    request<Paciente>(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletar: (id: number) => request<void>(`/pacientes/${id}`, { method: 'DELETE' }),
}

// ─── Profissionais ────────────────────────────────────────────────────────────
export const profissionaisApi = {
  listar: () => request<Profissional[]>('/profissionais'),
  buscarPorId: (id: number) => request<Profissional>(`/profissionais/${id}`),
  buscarPorEspecialidade: (esp: string) =>
    request<Profissional[]>(`/profissionais/especialidade/${esp}`),
  criar: (data: ProfissionalForm) =>
    request<Profissional>('/profissionais', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id: number, data: ProfissionalForm) =>
    request<Profissional>(`/profissionais/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletar: (id: number) => request<void>(`/profissionais/${id}`, { method: 'DELETE' }),
}

// ─── Anamneses ────────────────────────────────────────────────────────────────
export const anamnesesApi = {
  listar: () => request<Anamnese[]>('/anamneses'),
  buscarPorId: (id: number) => request<Anamnese>(`/anamneses/${id}`),
  buscarPorPaciente: (id: number) => request<Anamnese[]>(`/anamneses/paciente/${id}`),
  buscarPorUrgencia: (nivel: NivelUrgencia) =>
    request<Anamnese[]>(`/anamneses/urgencia/${nivel}`),
  triagem: () => request<Anamnese[]>('/anamneses/triagem'),
  criar: (data: AnamneseForm) =>
    request<Anamnese>('/anamneses', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id: number, data: AnamneseForm) =>
    request<Anamnese>(`/anamneses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletar: (id: number) => request<void>(`/anamneses/${id}`, { method: 'DELETE' }),
}

// ─── Agendamentos ─────────────────────────────────────────────────────────────
export const agendamentosApi = {
  listar: () => request<Agendamento[]>('/agendamentos'),
  buscarPorId: (id: number) => request<Agendamento>(`/agendamentos/${id}`),
  buscarPorPaciente: (id: number) => request<Agendamento[]>(`/agendamentos/paciente/${id}`),
  buscarPorProfissional: (id: number) =>
    request<Agendamento[]>(`/agendamentos/profissional/${id}`),
  buscarPorStatus: (status: StatusAgendamento) =>
    request<Agendamento[]>(`/agendamentos/status/${status}`),
  criar: (data: AgendamentoForm) =>
    request<Agendamento>('/agendamentos', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id: number, data: AgendamentoForm) =>
    request<Agendamento>(`/agendamentos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  atualizarStatus: (id: number, status: StatusAgendamento) =>
    request<Agendamento>(`/agendamentos/${id}/status?status=${status}`, { method: 'PATCH' }),
  deletar: (id: number) => request<void>(`/agendamentos/${id}`, { method: 'DELETE' }),
}

// ─── Consultas ────────────────────────────────────────────────────────────────
export const consultasApi = {
  listar: () => request<Consulta[]>('/consultas'),
  buscarPorId: (id: number) => request<Consulta>(`/consultas/${id}`),
  buscarPorPaciente: (id: number) => request<Consulta[]>(`/consultas/paciente/${id}`),
  buscarPorProfissional: (id: number) =>
    request<Consulta[]>(`/consultas/profissional/${id}`),
  criar: (data: ConsultaForm) =>
    request<Consulta>('/consultas', { method: 'POST', body: JSON.stringify(data) }),
  atualizar: (id: number, data: ConsultaForm) =>
    request<Consulta>(`/consultas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletar: (id: number) => request<void>(`/consultas/${id}`, { method: 'DELETE' }),
}
