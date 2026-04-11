import { getTranslations } from 'next-intl/server';
import UserTable from '@/components/admin/user-table';

export const metadata = {
  title: 'User Management - WaggingTails Admin',
};

export default async function AdminUsersPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-main">{t('userManagement')}</h1>
      </div>
      <UserTable />
    </div>
  );
}
