import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { theme } from '@/lib/theme';
import { LanguageToggle } from '@/components/language-toggle';
import { UserMenu } from '@/components/auth/user-menu';
import { MobileMenu } from './mobile-menu';

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations('common');
  const tDash = await getTranslations('dashboard');

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-text-main hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">{theme.logo.emoji}</span>
          <span>{theme.logo.name}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          <LanguageToggle />
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm px-3 py-1.5 rounded-md text-text-main hover:bg-background transition-colors"
              >
                {tDash('title')}
              </Link>
              <UserMenu email={user.email ?? ''} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm px-4 py-2 rounded-md text-text-main hover:bg-background transition-colors border border-border"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                {t('register')}
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />
          <MobileMenu isAuthenticated={!!user} email={user?.email ?? ''} />
        </div>
      </div>
    </header>
  );
}
