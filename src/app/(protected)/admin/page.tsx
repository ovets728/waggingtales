import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Admin Dashboard - WaggingTails',
};

async function getStats() {
  const supabase = await createClient();

  const { data: profiles } = await supabase.from('profiles').select('*');

  const users = profiles || [];
  const totalUsers = users.length;
  const paidUsers = users.filter((u) => u.has_paid).length;
  const freeUsers = totalUsers - paidUsers;
  const adminUsers = users.filter((u) => u.role === 'admin').length;

  return { totalUsers, paidUsers, freeUsers, adminUsers };
}

export default async function AdminPage() {
  const stats = await getStats();
  const t = await getTranslations('admin');
  const tc = await getTranslations('common');

  const statCards = [
    {
      label: t('totalUsers'),
      value: stats.totalUsers,
      color: 'text-primary',
    },
    {
      label: t('paidUsers'),
      value: stats.paidUsers,
      color: 'text-success',
    },
    {
      label: t('freeUsers'),
      value: stats.freeUsers,
      color: 'text-warning',
    },
    {
      label: t('adminUsers'),
      value: stats.adminUsers,
      color: 'text-primary',
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-text-main">{t('title')}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-surface border border-border rounded-lg p-6"
          >
            <p className="text-sm text-text-muted">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-main mb-4">
          {tc('quickLinks')}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            {tc('manageUsers')}
          </Link>
        </div>
      </div>
    </div>
  );
}
