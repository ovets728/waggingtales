import UserTable from '@/components/admin/user-table';

export const metadata = {
  title: 'User Management - WaggingTails Admin',
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-main">User Management</h1>
      </div>
      <UserTable />
    </div>
  );
}
