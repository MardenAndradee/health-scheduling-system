'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, pacientesApi } from '@/lib/api'
import { limparUsuario, obterUsuario, salvarUsuario } from '@/lib/auth'
import { LoginRequest, LoginResponse, PacienteForm, SessaoUsuario } from '@/types'

interface AuthContextValue {
  usuario: SessaoUsuario | null
  carregando: boolean
  login: (dados: LoginRequest) => Promise<SessaoUsuario>
  registrar: (dados: PacienteForm) => Promise<SessaoUsuario>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function aplicarResposta(resposta: LoginResponse): SessaoUsuario {
  const sessao: SessaoUsuario = {
    id: resposta.id,
    nome: resposta.nome,
    email: resposta.email,
    tipoUsuario: resposta.tipoUsuario,
  }
  // O token em si não passa por aqui — já chegou num cookie HttpOnly
  // (Set-Cookie da resposta de /auth/login), inacessível a este JavaScript.
  salvarUsuario(sessao)
  return sessao
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<SessaoUsuario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // localStorage não existe no servidor — a sessão só pode ser lida após o
    // mount, por isso é hidratada aqui em vez de via useState(() => ...).
    // Leitura otimista: o cookie HttpOnly não pode ser conferido por este
    // JavaScript, então confia no usuário salvo e deixa a primeira chamada
    // de API real corrigir sozinha via 401 se o cookie não for mais válido.
    const sessao = obterUsuario()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (sessao) setUsuario(sessao)
    setCarregando(false)
  }, [])

  const login = async (dados: LoginRequest) => {
    const resposta = await authApi.login(dados)
    const sessao = aplicarResposta(resposta)
    setUsuario(sessao)
    return sessao
  }

  const registrar = async (dados: PacienteForm) => {
    // Cria um Paciente de verdade (não só um Usuario genérico) e então loga —
    // POST /pacientes não retorna token, então o login é uma segunda chamada.
    await pacientesApi.criar(dados)
    const resposta = await authApi.login({ email: dados.email, senha: dados.senha })
    const sessao = aplicarResposta(resposta)
    setUsuario(sessao)
    return sessao
  }

  const logout = async () => {
    // Um cookie HttpOnly só pode ser apagado por quem o definiu — o
    // servidor — então logout precisa de uma chamada real. Melhor esforço:
    // uma falha de rede aqui não deve travar o usuário tentando sair.
    await authApi.logout().catch(() => {})
    limparUsuario()
    setUsuario(null)
    router.replace('/login')
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa ser usado dentro de <AuthProvider>')
  return ctx
}
