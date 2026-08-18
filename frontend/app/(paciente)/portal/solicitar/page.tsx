'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { anamnesesApi } from '@/lib/api'
import { Button, Card, Checkbox, Input, Select, Textarea } from '@/components/ui'
import { mensagemErro } from '@/lib/utils'
import {
  calcularNivelUrgencia, comorbidadeOpcoes, dorOpcoes, duracaoOpcoes,
  formatarResumoTriagem, DuracaoSintomas, RespostasTriagem,
} from '@/lib/triagem'

interface FormState {
  idade: string
  comorbidades: string[]
  sintomas: string
  duracaoSintomas: DuracaoSintomas
  dorIntensidade: string
  faltaAr: boolean
  febre: boolean
  sangramento: boolean
}

const vazio: FormState = {
  idade: '', comorbidades: [], sintomas: '', duracaoSintomas: 'horas',
  dorIntensidade: '0', faltaAr: false, febre: false, sangramento: false,
}

const TOTAL_PASSOS = 4

export default function SolicitarAtendimentoPage() {
  const { usuario } = useAuth()
  const [passo, setPasso] = useState(1)
  const [form, setForm] = useState<FormState>(vazio)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  const setCampo = <K extends keyof FormState>(campo: K) => (valor: FormState[K]) =>
    setForm(prev => ({ ...prev, [campo]: valor }))

  const alternarComorbidade = (valor: string) => {
    setForm(prev => ({
      ...prev,
      comorbidades: prev.comorbidades.includes(valor)
        ? prev.comorbidades.filter(c => c !== valor)
        : [...prev.comorbidades, valor],
    }))
  }

  const passo1Valido = form.idade.trim() !== '' && Number(form.idade) > 0 && Number(form.idade) < 130
  const passo2Valido = form.sintomas.trim() !== ''

  const podeAvancar = passo === 1 ? passo1Valido : passo === 2 ? passo2Valido : true

  const avancar = () => setPasso(p => Math.min(p + 1, TOTAL_PASSOS))
  const voltar = () => setPasso(p => Math.max(p - 1, 1))

  const handleEnviar = async () => {
    if (!usuario || enviando) return
    setEnviando(true)
    setErro('')
    try {
      const respostas: RespostasTriagem = {
        idade: Number(form.idade),
        comorbidades: form.comorbidades,
        sintomas: form.sintomas,
        duracaoSintomas: form.duracaoSintomas,
        dorIntensidade: Number(form.dorIntensidade),
        faltaAr: form.faltaAr,
        febre: form.febre,
        sangramento: form.sangramento,
      }
      await anamnesesApi.criar({
        sintomas: form.sintomas,
        observacoes: formatarResumoTriagem(respostas),
        nivelUrgencia: calcularNivelUrgencia(respostas),
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
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Passo {passo} de {TOTAL_PASSOS}</p>
      </div>

      {/* Barra de progresso simples */}
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: TOTAL_PASSOS }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i < passo ? 'var(--accent)' : 'var(--border)',
          }} />
        ))}
      </div>

      <Card>
        {passo === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Sobre você</div>
            <Input label="Sua idade" value={form.idade} onChange={setCampo('idade')} type="number" placeholder="Ex: 34" required />
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 8 }}>
                Você tem alguma dessas condições? (opcional)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {comorbidadeOpcoes.map(o => (
                  <Checkbox
                    key={o.value}
                    label={o.label}
                    checked={form.comorbidades.includes(o.value)}
                    onChange={() => alternarComorbidade(o.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {passo === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>O que você está sentindo?</div>
            <Textarea
              label="Descreva com suas palavras"
              value={form.sintomas}
              onChange={setCampo('sintomas')}
              placeholder="Ex: dor de cabeça forte desde ontem, com enjoo"
              rows={4}
            />
            <Select
              label="Quando começou?"
              value={form.duracaoSintomas}
              onChange={v => setCampo('duracaoSintomas')(v as DuracaoSintomas)}
              options={duracaoOpcoes}
            />
          </div>
        )}

        {passo === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Sinais de alerta</div>
            <Select
              label="Quanto está doendo, de 0 a 10?"
              value={form.dorIntensidade}
              onChange={setCampo('dorIntensidade')}
              options={dorOpcoes}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Checkbox label="Estou com falta de ar" checked={form.faltaAr} onChange={setCampo('faltaAr')} />
              <Checkbox label="Estou com febre" checked={form.febre} onChange={setCampo('febre')} />
              <Checkbox label="Estou com algum sangramento" checked={form.sangramento} onChange={setCampo('sangramento')} />
            </div>
          </div>
        )}

        {passo === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Confira antes de enviar</div>
            {[
              ['Idade', `${form.idade} anos`],
              ['Condições prévias', form.comorbidades.length > 0
                ? form.comorbidades.map(c => comorbidadeOpcoes.find(o => o.value === c)?.label).join(', ')
                : 'Nenhuma informada'],
              ['Sintomas', form.sintomas || '—'],
              ['Início dos sintomas', duracaoOpcoes.find(o => o.value === form.duracaoSintomas)?.label || '—'],
              ['Intensidade da dor', dorOpcoes.find(o => o.value === form.dorIntensidade)?.label || '—'],
              ['Sinais de alerta', [form.faltaAr && 'falta de ar', form.febre && 'febre', form.sangramento && 'sangramento']
                .filter(Boolean).join(', ') || 'Nenhum'],
            ].map(([label, valor]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.05em' }}>{String(label).toUpperCase()}</div>
                <div style={{ fontSize: 13.5, marginTop: 2 }}>{valor}</div>
              </div>
            ))}
          </div>
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
        {passo > 1 && (
          <Button variant="ghost" onClick={voltar} style={{ flex: 1, justifyContent: 'center' }}>
            Voltar
          </Button>
        )}
        {passo < TOTAL_PASSOS ? (
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
