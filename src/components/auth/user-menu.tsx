'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

interface UserMenuProps {
  email: string;
}

export function UserMenu({ email }: UserMenuProps) {
  const router = useRouter();
  const t = useTranslations('common');

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-text-muted">{email}</span>
      <button
        onClick={handleLogout}
        className="text-sm px-3 py-1.5 rounded-md border border-border text-text-main hover:bg-background transition-colors"
      >
        {t('logout')}
      </button>
    </div>
  );
}
