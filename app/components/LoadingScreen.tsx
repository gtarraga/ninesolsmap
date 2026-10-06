'use client';
import { useTranslations } from 'next-intl';

/** A localized status that occupies the remaining map area. */
export function LoadingScreen() {
  const t = useTranslations();
  return <div className="map-status" role="status"><span className="loading-dot" aria-hidden="true" />{t('loading')}</div>;
}
