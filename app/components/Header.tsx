'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CircleHelp } from 'lucide-react';
import LocaleSwitcher from './LocaleSwitcher';
import { SupportLink } from './SupportLink';

/** Keep map tools readable at phone widths while preserving the donation link. */
export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  return <header className="map-header">
    <Link href={`/${locale}`} className="map-title"><span className="hidden sm:inline">{t('title')}</span><span className="sm:hidden">{t('short-title')}</span></Link>
    <nav className="header-tools" aria-label={t('map-tools')}>
      <LocaleSwitcher />
      <Link href={`/${locale}/about`} className="tool-button" aria-label={t('about')} title={t('about')}><CircleHelp size={22} aria-hidden="true" /></Link>
      <SupportLink className="header-support" />
    </nav>
  </header>;
}
