'use client'

import { ReactNode, useState } from 'react'
import { X } from 'lucide-react'
import { urgenciaConfig, statusConfig } from '@/lib/utils'
import { NivelUrgencia, StatusAgendamento } from '@/types'

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start',
      justifyContent: 'space-between', marginBottom: 28,
    }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--text)' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', style, title,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  disabled?: boolean
  type?: 'button' | 'submit'
  style?: React.CSSProperties
  title?: string
}) {
  const [hover, setHover] = useState(false)

  const variants = {
    primary: {
      background: hover && !disabled ? 'var(--accent-hover)' : 'var(--accent)',
      color: '#fff', border: 'none',
    },
    ghost: {
      background: hover && !disabled ? 'var(--surface2)' : 'transparent',
      color: 'var(--text)', border: '1px solid var(--border)',
    },
    danger: {
      background: hover && !disabled ? '#FECDD3' : 'var(--danger-soft)',
      color: 'var(--danger)', border: '1px solid #FECDD3',
    },
  }
  const sizes = {
    sm: { padding: '7px 12px', fontSize: 12.5 },
    md: { padding: '10px 18px', fontSize: 14 },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 'var(--radius)',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .5 : 1,
        transition: 'background .15s, opacity .15s',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({
  label, value, onChange, placeholder, type = 'text', required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
        {label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '10px 13px',
          color: 'var(--text)',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          transition: 'border-color .15s, box-shadow .15s',
          width: '100%',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--accent)'
          e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--border)'
          e.target.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({
  label, value, onChange, options, required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  required?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
        {label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '10px 13px',
          color: value ? 'var(--text)' : 'var(--muted)',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          cursor: 'pointer',
          width: '100%',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--accent)'
          e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--border)'
          e.target.style.boxShadow = 'none'
        }}
      >
        <option value="">Selecione...</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
export function Checkbox({ label, checked, onChange }: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
      padding: '11px 13px', background: checked ? 'var(--accent-soft)' : 'var(--surface)',
      border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)',
      transition: 'background .15s, border-color .15s',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}
      />
      <span style={{ fontSize: 14, color: 'var(--text)' }}>{label}</span>
    </label>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({
  label, value, onChange, placeholder, rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '10px 13px',
          color: 'var(--text)',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          resize: 'vertical',
          width: '100%',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--accent)'
          e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--border)'
          e.target.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

// ─── Badge de Urgência ────────────────────────────────────────────────────────
// Elemento-assinatura do sistema: o "sinal de triagem". VERMELHO (emergência)
// ganha um pulso sutil no ponto — o único movimento de todo o sistema, e só
// para o nível mais crítico, para chamar atenção sem gerar ruído visual.
export function UrgenciaBadge({ nivel }: { nivel: NivelUrgencia }) {
  const cfg = urgenciaConfig[nivel]
  const emergencia = nivel === 'VERMELHO'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 11px', borderRadius: 'var(--radius-full)',
      fontSize: 12.5, fontWeight: 600,
      color: cfg.color, background: cfg.bg,
    }}>
      <span
        className={emergencia ? 'sinal-emergencia' : undefined}
        style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }}
      />
      {cfg.label}
    </span>
  )
}

// ─── Badge de Status ──────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: StatusAgendamento }) {
  const cfg = statusConfig[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 11px', borderRadius: 'var(--radius-full)',
      fontSize: 12.5, fontWeight: 600,
      color: cfg.color, background: `${cfg.color}1a`,
    }}>
      {cfg.label}
    </span>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose }: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto',
        padding: 24,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16.5, fontWeight: 600, color: 'var(--text)' }}>{title}</h2>
          <button onClick={onClose} aria-label="Fechar" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', lineHeight: 1, padding: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function Empty({ message }: { message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: 32, marginBottom: 10, opacity: .35 }}>◌</div>
      <p style={{ fontSize: 14, lineHeight: 1.5 }}>{message}</p>
    </div>
  )
}

// ─── Loading ──────────────────────────────────────────────────────────────────
export function Loading() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
      <p style={{ fontSize: 13.5 }}>Carregando...</p>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 100,
      background: type === 'success' ? 'var(--secondary-soft)' : 'var(--danger-soft)',
      border: `1px solid ${type === 'success' ? '#99F6E4' : '#FECDD3'}`,
      color: type === 'success' ? 'var(--secondary)' : 'var(--danger)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-md)',
      padding: '11px 18px',
      fontSize: 14,
      fontWeight: 500,
      maxWidth: 'calc(100vw - 48px)',
    }}>
      {message}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: boolean
}) {
  return (
    <Card>
      <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.04em', fontWeight: 500, marginBottom: 8 }}>
        {label.toUpperCase()}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 700,
        color: accent ? 'var(--accent)' : 'var(--text)',
        letterSpacing: '-.02em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </Card>
  )
}
