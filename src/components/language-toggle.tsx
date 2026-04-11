'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { locales, localeNames, type Locale } from '@/i18n/config';

const localeFlags: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  it: 'IT',
};

export function LanguageToggle() {
  const currentLocale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function switchLocale(locale: Locale) {
    if (locale === currentLocale) {
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      window.location.reload();
    } catch {
      setLoading(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-border text-text-main hover:bg-background transition-colors disabled:opacity-50"
        aria-label="Change language"
      >
        <span>{localeFlags[currentLocale]}</span>
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-surface border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-background transition-colors ${
                locale === currentLocale
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-main'
              }`}
            >
              <span className="font-mono text-xs">{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
