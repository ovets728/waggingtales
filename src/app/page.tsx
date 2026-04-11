import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations('landing');

  const ctaHref = user ? '/wizard' : '/register';

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-20 sm:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-main leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-text-muted max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <div className="mt-10">
            <Link
              href={ctaHref}
              className="inline-block px-8 py-3 text-lg font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg"
            >
              {t('getStarted')}
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 px-4 bg-surface">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main text-center mb-12">
            {t('howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-background border border-border rounded-xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-primary mb-2">1</div>
              <h3 className="text-lg font-semibold text-text-main mb-2">{t('step1')}</h3>
              <p className="text-text-muted text-sm">{t('step1Desc')}</p>
            </div>

            {/* Step 2 */}
            <div className="bg-background border border-border rounded-xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-4 text-2xl">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-secondary mb-2">2</div>
              <h3 className="text-lg font-semibold text-text-main mb-2">{t('step2')}</h3>
              <p className="text-text-muted text-sm">{t('step2Desc')}</p>
            </div>

            {/* Step 3 */}
            <div className="bg-background border border-border rounded-xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4 text-2xl">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-accent mb-2">3</div>
              <h3 className="text-lg font-semibold text-text-main mb-2">{t('step3')}</h3>
              <p className="text-text-muted text-sm">{t('step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main text-center mb-12">
            {t('pricing')}
          </h2>
          <div className="bg-surface border-2 border-primary rounded-xl p-8 text-center shadow-md">
            <div className="text-4xl font-bold text-text-main mb-2">
              {t('priceAmount')}
            </div>
            <p className="text-text-muted mb-6">{t('priceDesc')}</p>
            <ul className="text-left text-sm text-text-main space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI-generated story
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Custom illustrations
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PDF download
              </li>
            </ul>
            <Link
              href={ctaHref}
              className="inline-block w-full px-6 py-3 text-base font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              {t('priceCta')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
