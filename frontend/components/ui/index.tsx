'use client'

import { ReactNode } from 'react'
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
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', marginBottom: 28,
    }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{subtitle}</p>}
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
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', style,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  disabled?: boolean
  type?: 'button' | 'submit'
  style?: React.CSSProperties
}) {
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff', border: 'none' },
    ghost:   { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' },
    danger:  { background: 'rgba(239,68,68,.12)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,.2)' },
  }
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '9px 16px', fontSize: 13.5 },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: 'var(--radius)',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .5 : 1,
        transition: 'opacity .15s, filter .15s',
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
      <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, letterSpacing: '.04em' }}>
        {label}{required && <span style={{ color: 'var(--accent)' }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '9px 12px',
          color: 'var(--text)',
          fontSize: 13.5,
          fontFamily: 'DM Sans, sans-serif',
          outline: 'none',
          transition: 'border-color .15s',
          width: '100%',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
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
      <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, letterSpacing: '.04em' }}>
        {label}{required && <span style={{ color: 'var(--accent)' }}> *</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '9px 12px',
          color: value ? 'var(--text)' : 'var(--muted)',
          fontSize: 13.5,
          fontFamily: 'DM Sans, sans-serif',
          outline: 'none',
          cursor: 'pointer',
          width: '100%',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      >
        <option value="">Selecione...</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
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
      <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, letterSpacing: '.04em' }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '9px 12px',
          color: 'var(--text)',
          fontSize: 13.5,
          fontFamily: 'DM Sans, sans-serif',
          outline: 'none',
          resize: 'vertical',
          width: '100%',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}

// ─── Badge de Urgência ────────────────────────────────────────────────────────
export function UrgenciaBadge({ nivel }: { nivel: NivelUrgencia }) {
  const cfg = urgenciaConfig[nivel]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 500,
      color: cfg.color, background: cfg.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
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
      padding: '3px 9px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 500,
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
      background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto',
        padding: 24,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: 18, lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function Empty({ message }: { message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
      <div style={{ fontSize: 32, marginBottom: 10, opacity: .4 }}>◌</div>
      <p style={{ fontSize: 13.5 }}>{message}</p>
    </div>
  )
}

// ─── Loading ──────────────────────────────────────────────────────────────────
export function Loading() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
      <p style={{ fontSize: 13 }}>Carregando...</p>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 100,
      background: type === 'success' ? 'rgba(46,168,108,.15)' : 'rgba(239,68,68,.15)',
      border: `1px solid ${type === 'success' ? 'rgba(46,168,108,.3)' : 'rgba(239,68,68,.3)'}`,
      color: type === 'success' ? 'var(--accent)' : 'var(--danger)',
      borderRadius: 'var(--radius)',
      padding: '10px 16px',
      fontSize: 13.5,
      fontWeight: 500,
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
      <div style={{ fontSize: 11.5, color: 'var(--muted)', letterSpacing: '.05em', marginBottom: 8 }}>
        {label.toUpperCase()}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 600,
        color: accent ? 'var(--accent)' : 'var(--text)',
        fontFamily: 'DM Mono, monospace',
        letterSpacing: '-.02em',
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </Card>
  )
}
