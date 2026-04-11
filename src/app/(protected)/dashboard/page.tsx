import Link from 'next/link';
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
      {/* Welcome */}
      <h1 className="text-2xl font-bold text-text-main">
        {t('welcome', { email: profile.email })}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Status Card */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-main mb-4">
            {t('accountStatus')}
          </h2>
          <div className="space-y-3">
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
            {!profile.has_paid && (
              <div className="pt-2">
                <p className="text-sm text-text-muted mb-3">{t('upgradePrompt')}</p>
                <Link
                  href="/dashboard/upgrade"
                  className="inline-block px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                >
                  {t('upgrade')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Create Story Card */}
        {profile.has_paid && (
          <div className="bg-surface border border-border rounded-lg p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-main mb-2">
                {t('createStory')}
              </h2>
              <p className="text-sm text-text-muted">
                Turn your pet into the star of a magical storybook.
              </p>
            </div>
            <div className="mt-4">
              <Link
                href="/wizard"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('createStory')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* My Stories Section */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-main mb-4">
          {t('myStories')}
        </h2>
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-text-muted/40 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-text-muted">{t('noStories')}</p>
        </div>
      </div>
    </div>
  );
}
