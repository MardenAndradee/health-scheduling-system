import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Triagem | Posto de Saúde',
  description: 'Sistema de triagem e organização de atendimento',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
