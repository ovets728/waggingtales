import { getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/auth/helpers';

export const metadata = {
  title: 'Dashboard - WaggingTails',
};

export default async function DashboardPage() {
  const profile = await requireAuth();
  const t = await getTranslations('dashboard');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-main">
        {t('welcome', { email: profile.email })}
      </h1>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-main mb-2">
          {t('accountStatus')}
        </h2>
        <p className="text-text-muted">
          {t('paymentStatus')}{' '}
          <span
            className={
              profile.has_paid
                ? 'text-success font-medium'
                : 'text-warning font-medium'
            }
          >
            {profile.has_paid ? t('paid') : t('free')}
          </span>
        </p>
        <p className="text-text-muted">
          {t('role')}{' '}
          <span className="font-medium text-text-main">{profile.role}</span>
        </p>
      </div>
    </div>
  );
}
