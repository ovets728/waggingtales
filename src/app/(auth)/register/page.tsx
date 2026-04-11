import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Create Account - WaggingTails',
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-text-main text-center mb-6">
        Create Account
      </h1>
      <RegisterForm />
    </>
  );
}
