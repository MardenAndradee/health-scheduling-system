import { Guard } from '@/components/auth/Guard'
import { AppShell } from '@/components/layout/AppShell'

export default function ProfissionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard papeis={['PROFISSIONAL', 'ADMIN']}>
      <AppShell>{children}</AppShell>
    </Guard>
  )
}
