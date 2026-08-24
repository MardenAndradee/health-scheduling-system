'use client'

import { useEffect } from 'react'
import { Input } from '@/components/ui'
import { apenasDigitos, maskCep } from '@/lib/utils'
import { useCepLookup } from '@/hooks/useCepLookup'

export interface EnderecoValor {
  cep: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
}

export const enderecoVazio: EnderecoValor = { cep: '', endereco: '', bairro: '', cidade: '', estado: '' }

/**
 * Bloco de endereço completo (CEP com busca automática via ViaCEP + rua/bairro/
 * cidade/UF), reutilizado em qualquer formulário que cadastre um paciente
 * (cadastro público e "Novo/Editar paciente" do profissional).
 */
export function EnderecoFields({ valor, onChange }: {
  valor: EnderecoValor
  onChange: <K extends keyof EnderecoValor>(campo: K) => (v: string) => void
}) {
  const { status: statusCep, buscar: buscarCep } = useCepLookup()

  useEffect(() => {
    if (valor.cep.length !== 8) return
    buscarCep(valor.cep).then(endereco => {
      if (!endereco) return
      onChange('endereco')(endereco.endereco)
      onChange('bairro')(endereco.bairro)
      onChange('cidade')(endereco.cidade)
      onChange('estado')(endereco.estado)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor.cep])

  return (
    <>
      <div>
        <Input
          label="CEP" value={maskCep(valor.cep)}
          onChange={v => onChange('cep')(apenasDigitos(v).slice(0, 8))}
          placeholder="00000-000" required
        />
        {statusCep === 'buscando' && (
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 5 }}>Buscando endereço...</p>
        )}
        {statusCep === 'nao_encontrado' && (
          <p style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 5 }}>CEP não encontrado — preencha o endereço manualmente.</p>
        )}
        {statusCep === 'erro' && (
          <p style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 5 }}>Não foi possível buscar o CEP agora — preencha manualmente.</p>
        )}
      </div>

      <Input label="Endereço" value={valor.endereco} onChange={onChange('endereco')} placeholder="Rua, número, complemento" required />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Bairro" value={valor.bairro} onChange={onChange('bairro')} required />
        <Input label="Cidade" value={valor.cidade} onChange={onChange('cidade')} required />
      </div>

      <Input label="Estado" value={valor.estado} onChange={onChange('estado')} placeholder="UF" required />
    </>
  )
}
