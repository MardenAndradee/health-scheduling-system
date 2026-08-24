'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { anamnesesApi, pacientesApi } from '@/lib/api'
import { Button, Card, Stepper } from '@/components/ui'
import { apenasDigitos, mensagemErro } from '@/lib/utils'
import { buscarEspecialidade } from '@/lib/especialidades/config'
import { calcularNivelUrgenciaEspecialidade } from '@/lib/especialidades/pontuacao'
import { formatarQueixa, formatarResumoAnamnese } from '@/lib/especialidades/resumo'
import {
  Especialidade, EspecialidadeId, IdentificacaoForm, RespostasEspecialidade, RespostaValor,
  identificacaoVazia,
} from '@/lib/especialidades/tipos'
import { EtapaEspecialidade } from './_components/EtapaEspecialidade'
import { EtapaIdentificacao } from './_components/EtapaIdentificacao'
import { EtapaGrupoPerguntas } from './_components/EtapaGrupoPerguntas'
import { EtapaRevisao } from './_components/EtapaRevisao'

type Passo =
  | { tipo: 'especialidade' }
  | { tipo: 'identificacao' }
  | { tipo: 'grupo'; grupoId: string }
  | { tipo: 'revisao' }

function construirPassos(especialidade: Especialidade | null): Passo[] {
  const passos: Passo[] = [{ tipo: 'especialidade' }]
  if (!especialidade) return passos
  passos.push({ tipo: 'identificacao' })
  especialidade.grupos.forEach(g => passos.push({ tipo: 'grupo', grupoId: g.id }))
  passos.push({ tipo: 'revisao' })
  return passos
}

function calcularIdade(dataNascimentoIso: string): number {
  const hoje = new Date()
  const nascimento = new Date(dataNascimentoIso)
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())
  if (aindaNaoFezAniversario) idade--
  return idade
}

const identificacaoValida = (form: IdentificacaoForm) =>
  form.nomeCompleto.trim() !== '' &&
  Number(form.idade) > 0 && Number(form.idade) < 130 &&
  form.sexo !== '' &&
  apenasDigitos(form.cpf).length === 11 &&
  form.cor !== '' &&
  form.endereco.trim() !== '' &&
  form.bairro.trim() !== '' &&
  form.cidade.trim() !== '' &&
  form.estado.trim() !== '' &&
  apenasDigitos(form.cep).length === 8 &&
  apenasDigitos(form.celular).length >= 10 &&
  form.queixaPrincipal.trim() !== ''

export default function SolicitarAtendimentoPage() {
  const { usuario } = useAuth()

  const [especialidadeId, setEspecialidadeId] = useState<EspecialidadeId | null>(null)
  const [identificacao, setIdentificacao] = useState<IdentificacaoForm>(identificacaoVazia)
  const [respostas, setRespostas] = useState<RespostasEspecialidade>({})
  const [passoIndex, setPassoIndex] = useState(0)

  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  const especialidadeAtual = especialidadeId ? buscarEspecialidade(especialidadeId) ?? null : null
  const passos = useMemo(() => construirPassos(especialidadeAtual), [especialidadeAtual])
  const passoAtual = passos[passoIndex]

  // Pré-preenche com os dados que o paciente já cadastrou, poupando digitação.
  // Falha é silenciosa — o formulário só começa vazio, como hoje.
  useEffect(() => {
    if (!usuario) return
    pacientesApi.buscarPorId(usuario.id).then(paciente => {
      setIdentificacao(prev => ({
        ...prev,
        nomeCompleto: prev.nomeCompleto || paciente.nome,
        cpf: prev.cpf || apenasDigitos(paciente.cpf),
        celular: prev.celular || (paciente.telefone ? apenasDigitos(paciente.telefone) : ''),
        endereco: prev.endereco || paciente.endereco || '',
        idade: prev.idade || String(calcularIdade(paciente.dataNascimento)),
      }))
    }).catch(() => { /* pré-preenchimento é só conveniência — segue sem ele */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id])

  const setCampo = <K extends keyof IdentificacaoForm>(campo: K) => (valor: IdentificacaoForm[K]) =>
    setIdentificacao(prev => ({ ...prev, [campo]: valor }))

  const selecionarEspecialidade = (id: EspecialidadeId) => {
    if (id !== especialidadeId) {
      setRespostas({}) // respostas são indexadas por grupoId, que muda entre especialidades
      setEspecialidadeId(id)
    }
  }

  const setRespostaPergunta = (grupoId: string, perguntaId: string, valor: RespostaValor) => {
    setRespostas(prev => ({
      ...prev,
      [grupoId]: { ...prev[grupoId], [perguntaId]: valor },
    }))
  }

  const podeAvancar = (() => {
    switch (passoAtual.tipo) {
      case 'especialidade': return especialidadeId !== null
      case 'identificacao': return identificacaoValida(identificacao)
      case 'grupo': return true
      case 'revisao': return true
    }
  })()

  const avancar = () => setPassoIndex(i => Math.min(i + 1, passos.length - 1))
  const voltar = () => setPassoIndex(i => Math.max(i - 1, 0))

  const handleEnviar = async () => {
    if (!usuario || !especialidadeAtual || enviando) return
    setEnviando(true)
    setErro('')
    try {
      const idade = Number(identificacao.idade)
      const nivel = calcularNivelUrgenciaEspecialidade(especialidadeAtual, respostas, idade)
      await anamnesesApi.criar({
        sintomas: formatarQueixa(especialidadeAtual, identificacao.queixaPrincipal),
        observacoes: formatarResumoAnamnese(identificacao, especialidadeAtual, respostas, nivel),
        nivelUrgencia: nivel,
        pacienteId: usuario.id,
      })
      setEnviado(true)
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, paddingTop: 40 }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%', background: 'var(--secondary-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--secondary)',
        }}>✓</div>
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>Solicitação enviada</h1>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', maxWidth: 320, lineHeight: 1.6 }}>
          O posto de saúde vai avaliar suas informações e agendar seu atendimento.
          Você pode acompanhar a situação em &quot;Agenda&quot;.
        </p>
        <Link href="/portal/agendamentos" style={{ width: '100%', textDecoration: 'none' }}>
          <Button style={{ width: '100%', justifyContent: 'center' }}>Ver meus agendamentos</Button>
        </Link>
        <Link href="/portal/inicio" style={{ fontSize: 13, color: 'var(--muted)' }}>
          Voltar ao início
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Solicitar atendimento</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Passo {passoIndex + 1} de {passos.length}</p>
      </div>

      <Stepper total={passos.length} atual={passoIndex + 1} />

      <Card>
        {passoAtual.tipo === 'especialidade' && (
          <EtapaEspecialidade selecionada={especialidadeId} onSelecionar={selecionarEspecialidade} />
        )}

        {passoAtual.tipo === 'identificacao' && (
          <EtapaIdentificacao form={identificacao} setCampo={setCampo} />
        )}

        {passoAtual.tipo === 'grupo' && especialidadeAtual && (() => {
          const grupo = especialidadeAtual.grupos.find(g => g.id === passoAtual.grupoId)
          if (!grupo) return null
          return (
            <EtapaGrupoPerguntas
              grupo={grupo}
              respostas={respostas[grupo.id] || {}}
              onChange={(perguntaId, valor) => setRespostaPergunta(grupo.id, perguntaId, valor)}
            />
          )
        })()}

        {passoAtual.tipo === 'revisao' && especialidadeAtual && (
          <EtapaRevisao especialidade={especialidadeAtual} identificacao={identificacao} respostas={respostas} />
        )}
      </Card>

      {erro && (
        <p style={{
          fontSize: 13, color: 'var(--danger)', background: 'var(--danger-soft)',
          padding: '10px 13px', borderRadius: 'var(--radius)', border: '1px solid #FECDD3',
        }}>
          {erro}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {passoIndex > 0 && (
          <Button variant="ghost" onClick={voltar} style={{ flex: 1, justifyContent: 'center' }}>
            Voltar
          </Button>
        )}
        {passoAtual.tipo !== 'revisao' ? (
          <Button onClick={avancar} disabled={!podeAvancar} style={{ flex: 1, justifyContent: 'center' }}>
            Continuar
          </Button>
        ) : (
          <Button onClick={handleEnviar} disabled={enviando} style={{ flex: 1, justifyContent: 'center' }}>
            {enviando ? 'Enviando...' : 'Enviar solicitação'}
          </Button>
        )}
      </div>
    </div>
  )
}
