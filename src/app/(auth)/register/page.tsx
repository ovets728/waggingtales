import { getTranslations } from 'next-intl/server';
import { RegisterForm } from '@/components/auth/register-form';
import { LanguageToggle } from '@/components/language-toggle';

export const metadata = {
  title: 'Create Account - WaggingTails',
};

export default async function RegisterPage() {
  const t = await getTranslations('auth');

  return (
    <>
      <div className="flex justify-end mb-4">
        <LanguageToggle />
      </div>
      <h1 className="text-2xl font-bold text-text-main text-center mb-6">
        {t('registerTitle')}
      </h1>
      <RegisterForm />
    </>
  );
}
