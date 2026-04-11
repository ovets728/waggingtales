import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/components/auth/login-form';
import { LanguageToggle } from '@/components/language-toggle';

export const metadata = {
  title: 'Sign In - WaggingTails',
};

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <>
      <div className="flex justify-end mb-4">
        <LanguageToggle />
      </div>
      <h1 className="text-2xl font-bold text-text-main text-center mb-6">
        {t('loginTitle')}
      </h1>
      <LoginForm />
    </>
  );
}
