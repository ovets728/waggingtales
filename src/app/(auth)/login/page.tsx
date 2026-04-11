import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Sign In - WaggingTails',
};

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-text-main text-center mb-6">
        Sign In
      </h1>
      <LoginForm />
    </>
  );
}
