import { Guard } from '@/components/auth/Guard'
import { AppShell } from '@/components/layout/AppShell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard papeis={['ADMIN']}>
      <AppShell>{children}</AppShell>
    </Guard>
  )
}
