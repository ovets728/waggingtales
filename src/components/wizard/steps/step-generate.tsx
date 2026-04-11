'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useWizard } from '@/lib/wizard/store';

type Status = 'generating' | 'success' | 'error';

const PROGRESS_MESSAGES_EN = [
  'Teaching {petName} to read...',
  'Mixing paint colors...',
  'Writing chapter 1...',
  'Drawing illustrations...',
  'Adding sparkles...',
  'Writing chapter 2...',
  'Choosing the perfect ending...',
  'Binding the pages...',
];

export function StepGenerate() {
  const t = useTranslations('wizard');
  const locale = useLocale();
  const { state, dispatch } = useWizard();

  const [status, setStatus] = useState<Status>('generating');
  const [storyTitle, setStoryTitle] = useState('');
  const [pdfBase64, setPdfBase64] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

  const hasStarted = useRef(false);

  // Rotate progress messages every 3.5 seconds
  useEffect(() => {
    if (status !== 'generating') return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES_EN.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [status]);

  const generate = useCallback(async () => {
    setStatus('generating');
    setErrorMessage('');
    setMessageIndex(0);

    try {
      const body = {
        petName: state.petName,
        petPersonality: state.petPersonality,
        petImageBase64: state.petImagePreview ?? undefined,
        hasHuman: state.hasHuman,
        humanIsMinor: state.humanIsMinor,
        humanDescription: state.humanDescription,
        humanHairColor: state.humanHairColor,
        humanClothing: state.humanClothing,
        humanPersonality: state.humanPersonality,
        humanImageBase64:
          state.hasHuman && !state.humanIsMinor
            ? state.humanImagePreview ?? undefined
            : undefined,
        theme: state.theme,
        artStyle: state.artStyle,
        language: locale,
      };

      const res = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error || `HTTP ${res.status}`
        );
      }

      const data = (await res.json()) as {
        title: string;
        pdfBase64: string;
      };

      setStoryTitle(data.title);
      setPdfBase64(data.pdfBase64);
      setStatus('success');
    } catch (err) {
      console.error('Generation failed:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Unknown error'
      );
      setStatus('error');
    }
  }, [state, locale]);

  // Auto-trigger on mount
  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      generate();
    }
  }, [generate]);

  const handleDownload = () => {
    if (!pdfBase64) return;
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'waggingtails-story.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  const handleRetry = () => {
    hasStarted.current = false;
    generate();
  };

  const currentMessage = PROGRESS_MESSAGES_EN[messageIndex].replace(
    '{petName}',
    state.petName || 'your pet'
  );

  /* ---- Generating state ---- */
  if (status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-8 max-w-lg mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-text-main">
            {t('step5Title')}
          </h2>
          <p className="text-text-muted text-sm">{t('step5Subtitle')}</p>
        </div>

        {/* Spinner */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-border" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">
            🐾
          </span>
        </div>

        {/* Rotating messages */}
        <p className="text-sm text-text-muted animate-pulse text-center min-h-[1.5rem]">
          {currentMessage}
        </p>
      </div>
    );
  }

  /* ---- Error state ---- */
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-text-main">
            {t('generationFailed')}
          </h2>
          {errorMessage && (
            <p className="text-sm text-text-muted">{errorMessage}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleRetry}
          className="px-6 py-2 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  /* ---- Success state ---- */
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-text-main">
          {t('step5Title')}
        </h2>
        {storyTitle && (
          <p className="text-lg text-text-main font-medium">{storyTitle}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="px-6 py-3 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          {t('downloadPdf')}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 text-sm font-medium rounded-md border border-border text-text-main hover:bg-background transition-colors"
        >
          Create Another Story
        </button>
      </div>
    </div>
  );
}
