import { requireAdmin } from '@/lib/auth/helpers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /login if not authenticated,
  // or to /dashboard if not an admin
  await requireAdmin();

  return <>{children}</>;
}
