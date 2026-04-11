import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/auth/helpers';
import { PayNowButton } from './pay-now-button';

export const metadata = {
  title: 'Upgrade - WaggingTails',
};

export default async function UpgradePage() {
  const profile = await requireAuth();
  const t = await getTranslations('payment');

  if (profile.has_paid) {
    redirect('/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-surface border border-border rounded-lg p-8 max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-text-main">
          {t('upgradeTitle')}
        </h1>
        <p className="text-text-muted">
          {t('upgradeDesc')}
        </p>
        <div className="text-4xl font-bold text-primary">
          {t('price')}
        </div>
        <p className="text-sm text-text-muted">
          One-time payment
        </p>
        <PayNowButton label={t('payNow')} />
      </div>
    </div>
  );
}
