import { Guard } from '@/components/auth/Guard'
import { PortalShell } from '@/components/layout/PortalShell'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard papeis={['PACIENTE']}>
      <PortalShell>{children}</PortalShell>
    </Guard>
  )
}
