'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

export function RegisterForm() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError(t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="p-3 rounded-md bg-success/10 text-success text-sm">
          {t('registerSuccess')}
        </div>
        <p className="text-sm text-text-muted">
          {t('alreadyConfirmed')}{' '}
          <Link href="/login" className="text-primary hover:underline">
            {t('signIn')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-main mb-1">
          {tc('email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={t('emailPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text-main mb-1">
          {tc('password')}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={t('passwordMinPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-main mb-1">
          {tc('confirmPassword')}
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={t('confirmPasswordPlaceholder')}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-primary text-white rounded-md font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? t('creatingAccount') : t('createAccount')}
      </button>

      <p className="text-center text-sm text-text-muted">
        {t('haveAccount')}{' '}
        <Link href="/login" className="text-primary hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </form>
  );
}
