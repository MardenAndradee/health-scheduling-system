'use client'

import { useRef, useState } from 'react'

export type CepStatus = 'idle' | 'buscando' | 'sucesso' | 'nao_encontrado' | 'erro'

export interface EnderecoViaCep {
  endereco: string
  bairro: string
  cidade: string
  estado: string
}

interface RespostaViaCep {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

/**
 * Busca de endereço por CEP via ViaCEP (https://viacep.com.br), sem chave de
 * API. Guarda contra CEP duplicado (evita nova busca do mesmo valor) e
 * contra resposta obsoleta (se o usuário já mudou o CEP antes da resposta
 * anterior chegar, ela é descartada).
 */
export function useCepLookup() {
  const [status, setStatus] = useState<CepStatus>('idle')
  const ultimoCepRef = useRef<string | null>(null)
  const idBuscaRef = useRef(0)

  async function buscar(cepDigits: string): Promise<EnderecoViaCep | null> {
    if (cepDigits.length !== 8 || cepDigits === ultimoCepRef.current) return null

    ultimoCepRef.current = cepDigits
    const idDestaBusca = ++idBuscaRef.current
    setStatus('buscando')

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
      if (idDestaBusca !== idBuscaRef.current) return null // resposta obsoleta

      if (!res.ok) {
        setStatus('erro')
        return null
      }

      const dados: RespostaViaCep = await res.json()
      if (idDestaBusca !== idBuscaRef.current) return null

      if (dados.erro) {
        setStatus('nao_encontrado')
        return null
      }

      setStatus('sucesso')
      return {
        endereco: dados.logradouro || '',
        bairro: dados.bairro || '',
        cidade: dados.localidade || '',
        estado: dados.uf || '',
      }
    } catch {
      if (idDestaBusca === idBuscaRef.current) setStatus('erro')
      return null
    }
  }

  return { status, buscar }
}
