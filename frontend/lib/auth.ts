import { SessaoUsuario, TipoUsuario } from '@/types'

const TOKEN_KEY = 'triagem.token'
const USUARIO_KEY = 'triagem.usuario'

export function salvarSessao(token: string, usuario: SessaoUsuario) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
}

export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USUARIO_KEY)
}

export function obterToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function obterUsuario(): SessaoUsuario | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USUARIO_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessaoUsuario
  } catch {
    return null
  }
}

export function rotaInicialPorPapel(tipo: TipoUsuario): string {
  return tipo === 'PACIENTE' ? '/portal/inicio' : '/dashboard'
}
