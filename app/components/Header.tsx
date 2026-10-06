'use client';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import HelpModal from './HelpModal';
import LocaleSwitcher from './LocaleSwitcher';

/** Keep map tools readable at phone widths while preserving the donation link. */
export function Header() {
  const t = useTranslations();
  return <header className="map-header">
    <h1 className="map-title"><span className="hidden sm:inline">{t('title')}</span><span className="sm:hidden">{t('short-title')}</span></h1>
    <nav className="header-tools" aria-label={t('map-tools')}>
      <LocaleSwitcher />
      <HelpModal />
      <a className="support-link" href="https://ko-fi.com/gtarraga" target="_blank" rel="noopener noreferrer" aria-label={t('kofi-button')} title={t('kofi-button')}>
        <Heart size={18} aria-hidden="true" /><span className="hidden md:inline">{t('support')}</span>
      </a>
    </nav>
  </header>;
}
