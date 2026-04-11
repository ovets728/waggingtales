'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function PayNowButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations('common');

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? t('loading') : label}
    </button>
  );
}
