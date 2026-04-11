'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface MobileMenuProps {
  isAuthenticated: boolean;
  email: string;
}

export function MobileMenu({ isAuthenticated, email }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('common');
  const tDash = useTranslations('dashboard');
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md text-text-main hover:bg-background transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 border-b border-border bg-surface shadow-lg z-50">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-text-muted px-3 py-1">{email}</span>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-sm px-3 py-2 rounded-md text-text-main hover:bg-background transition-colors"
                >
                  {tDash('title')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left text-sm px-3 py-2 rounded-md text-text-main hover:bg-background transition-colors"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm px-3 py-2 rounded-md text-text-main hover:bg-background transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="text-sm px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors text-center"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
