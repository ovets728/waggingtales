import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { theme } from '@/lib/theme';

export async function Footer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations('common');
  const tDash = await getTranslations('dashboard');

  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-2 text-text-muted">
            <span className="text-lg">{theme.logo.emoji}</span>
            <span className="font-semibold">{theme.logo.name}</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-text-muted">
            <Link href="/" className="hover:text-text-main transition-colors">
              Home
            </Link>
            {user ? (
              <Link href="/dashboard" className="hover:text-text-main transition-colors">
                {tDash('title')}
              </Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-text-main transition-colors">
                  {t('login')}
                </Link>
                <Link href="/register" className="hover:text-text-main transition-colors">
                  {t('register')}
                </Link>
              </>
            )}
          </nav>

          {/* Copyright */}
          <p className="text-sm text-text-muted">
            &copy; 2026 {theme.logo.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
