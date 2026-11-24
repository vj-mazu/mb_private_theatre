import { redirect } from 'next/navigation';
import { getSession } from '@/lib/server/auth';
import { AdminShell } from '@/components/admin/AdminShell';
import { ConfirmProvider, ToastProvider } from '@/components/ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin', robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AdminShell user={{ name: session.name, role: session.role }}>{children}</AdminShell>
      </ConfirmProvider>
    </ToastProvider>
  );
}
