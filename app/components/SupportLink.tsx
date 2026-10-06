'use client';
import { Coffee } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Visible donation control for the responsive map header. */
export function SupportLink({className}:{readonly className:string}) {
  const t = useTranslations();
  return <a className={`support-link ${className}`} href="https://ko-fi.com/gtarraga"
    target="_blank" rel="noopener noreferrer" aria-label={t('kofi-button')} title={t('kofi-button')}>
    <Coffee size={18} aria-hidden="true" /><span>{t('support')}</span>
  </a>;
}
