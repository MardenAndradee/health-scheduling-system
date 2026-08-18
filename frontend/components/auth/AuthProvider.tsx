'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, pacientesApi } from '@/lib/api'
import { limparSessao, obterToken, obterUsuario, salvarSessao } from '@/lib/auth'
import { LoginRequest, LoginResponse, PacienteForm, SessaoUsuario } from '@/types'

interface AuthContextValue {
  usuario: SessaoUsuario | null
  carregando: boolean
  login: (dados: LoginRequest) => Promise<SessaoUsuario>
  registrar: (dados: PacienteForm) => Promise<SessaoUsuario>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function aplicarResposta(resposta: LoginResponse): SessaoUsuario {
  const sessao: SessaoUsuario = {
    id: resposta.id,
    nome: resposta.nome,
    email: resposta.email,
    tipoUsuario: resposta.tipoUsuario,
  }
  salvarSessao(resposta.token, sessao)
  return sessao
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<SessaoUsuario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // localStorage não existe no servidor — a sessão só pode ser lida após o
    // mount, por isso é hidratada aqui em vez de via useState(() => ...).
    const token = obterToken()
    const sessao = obterUsuario()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token && sessao) setUsuario(sessao)
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

  const logout = () => {
    limparSessao()
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
