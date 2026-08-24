'use client'

import { useEffect } from 'react'
import { Input, Select, Textarea } from '@/components/ui'
import { apenasDigitos, maskCep, maskCpf, maskTelefone } from '@/lib/utils'
import { IdentificacaoForm } from '@/lib/especialidades/tipos'
import { useCepLookup } from '@/hooks/useCepLookup'

const sexoOpcoes = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
]

const corOpcoes = [
  { value: 'branca', label: 'Branca' },
  { value: 'preta', label: 'Preta' },
  { value: 'parda', label: 'Parda' },
  { value: 'amarela', label: 'Amarela' },
  { value: 'indigena', label: 'Indígena' },
]

export function EtapaIdentificacao({ form, setCampo }: {
  form: IdentificacaoForm
  setCampo: <K extends keyof IdentificacaoForm>(campo: K) => (valor: IdentificacaoForm[K]) => void
}) {
  const { status: statusCep, buscar: buscarCep } = useCepLookup()

  useEffect(() => {
    if (form.cep.length !== 8) return
    buscarCep(form.cep).then(endereco => {
      if (!endereco) return
      setCampo('endereco')(endereco.endereco)
      setCampo('bairro')(endereco.bairro)
      setCampo('cidade')(endereco.cidade)
      setCampo('estado')(endereco.estado)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cep])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>Identificação</div>

      <Input label="Nome completo" value={form.nomeCompleto} onChange={setCampo('nomeCompleto')} required />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Idade" value={form.idade} onChange={setCampo('idade')} type="number" required />
        <Select
          label="Sexo" value={form.sexo}
          onChange={v => setCampo('sexo')(v as IdentificacaoForm['sexo'])}
          options={sexoOpcoes} required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input
          label="CPF" value={maskCpf(form.cpf)}
          onChange={v => setCampo('cpf')(apenasDigitos(v).slice(0, 11))}
          placeholder="000.000.000-00" required
        />
        <Select
          label="Cor/Raça" value={form.cor}
          onChange={v => setCampo('cor')(v as IdentificacaoForm['cor'])}
          options={corOpcoes} required
        />
      </div>

      <Input label="Naturalidade" value={form.naturalidade} onChange={setCampo('naturalidade')} placeholder="Cidade onde nasceu" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <Input
            label="CEP" value={maskCep(form.cep)}
            onChange={v => setCampo('cep')(apenasDigitos(v).slice(0, 8))}
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
        <Input
          label="Celular" value={maskTelefone(form.celular)}
          onChange={v => setCampo('celular')(apenasDigitos(v).slice(0, 11))}
          placeholder="(00) 00000-0000" required
        />
      </div>

      <Input label="Endereço" value={form.endereco} onChange={setCampo('endereco')} placeholder="Rua, número, complemento" required />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Bairro" value={form.bairro} onChange={setCampo('bairro')} required />
        <Input label="Cidade" value={form.cidade} onChange={setCampo('cidade')} required />
      </div>

      <Input label="Estado" value={form.estado} onChange={setCampo('estado')} placeholder="UF" required />

      <Textarea
        label="Queixa principal"
        value={form.queixaPrincipal}
        onChange={setCampo('queixaPrincipal')}
        placeholder="Descreva com suas palavras o motivo da consulta"
        rows={3}
      />
    </div>
  )
}
