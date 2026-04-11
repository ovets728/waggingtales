import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/auth/helpers';

export const metadata = {
  title: 'Payment Successful - WaggingTails',
};

export default async function UpgradeSuccessPage() {
  await requireAuth();
  const t = await getTranslations('payment');

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-surface border border-border rounded-lg p-8 max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-main">
          {t('successTitle')}
        </h1>
        <p className="text-text-muted">
          {t('successDesc')}
        </p>
        <Link
          href="/wizard"
          className="inline-block w-full py-3 px-6 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-center"
        >
          {t('startWizard')}
        </Link>
      </div>
    </div>
  );
}
