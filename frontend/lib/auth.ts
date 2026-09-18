import { SessaoUsuario, TipoUsuario } from '@/types'

const USUARIO_KEY = 'triagem.usuario'

// O token em si não passa mais por aqui — vive só num cookie HttpOnly
// definido pelo backend, que o JavaScript do navegador nunca consegue ler.
// O que sobra pra guardar no cliente é só a informação de exibição (não
// sensível, já visível na própria UI).

export function salvarUsuario(usuario: SessaoUsuario) {
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
}

export function limparUsuario() {
  localStorage.removeItem(USUARIO_KEY)
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
