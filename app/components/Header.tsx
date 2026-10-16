'use client';
import Link from 'next/link';
import { isLocale, localePath } from '@/lib/locales';
import { useLocale, useTranslations } from 'next-intl';
import { CircleHelp } from 'lucide-react';
import LocaleSwitcher from './LocaleSwitcher';
import { SupportLink } from './SupportLink';

/** Keep map tools readable at phone widths while preserving the donation link. */
export function Header() {
  const t = useTranslations();
  const requestedLocale = useLocale();
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';
  return <header className="map-header">
    <Link href={localePath(locale)} className="map-title"><span className="hidden sm:inline">{t('title')}</span><span className="sm:hidden">{t('short-title')}</span></Link>
    <nav className="header-tools" aria-label={t('map-tools')}>
      <LocaleSwitcher />
      <Link href={localePath(locale,'/about')} className="tool-button" aria-label={t('about')} title={t('about')}><CircleHelp size={22} aria-hidden="true" /></Link>
      <SupportLink className="header-support" />
    </nav>
  </header>;
}
