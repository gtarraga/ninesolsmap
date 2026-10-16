import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { MapView } from '@/app/components/MapView';
import { isLocale, localePath, pageAlternates } from '@/lib/locales';
import { getCategoryTranslationKey } from '@/lib/markers';
import { markerDescription, readPageMarkers } from '@/lib/page-markers';

type RouteParams = {locale:string; markerId:string};

/** Render current notes at request time, including during an upstream outage. */
export const dynamic = 'force-dynamic';

/** Give shared marker URLs descriptive metadata based on their existing notes. */
export async function generateMetadata({params:{locale,markerId}}:{params:RouteParams}) {
  if (!isLocale(locale)) notFound();
  const result = await readPageMarkers();
  const marker = result._tag === 'ok' ? result.value.find(item=>item.id===markerId) : undefined;
  const t = await getTranslations({locale});
  const description = marker ? markerDescription(marker,locale) : t('location-unavailable');
  return {title:`${description.slice(0,90)} · ${t('short-title')}`,description,
    alternates:pageAlternates(locale,`/${encodeURIComponent(markerId)}`),
    openGraph:{title:description.slice(0,90),description}};
}

/** Show the stored location note before Leaflet loads, preserving the shared map view. */
export default async function MapPage({params:{locale,markerId}}:{params:RouteParams}) {
  if (!isLocale(locale)) notFound();
  const result = await readPageMarkers();
  const marker = result._tag === 'ok' ? result.value.find(item=>item.id===markerId) : undefined;
  if (result._tag === 'ok' && !marker) notFound();
  const t = await getTranslations({locale});
  const key = marker && getCategoryTranslationKey(marker.type);
  const category = marker ? key && t.has(key) ? t(key) : marker.type : t('location-note');
  return <>
    <details className="location-summary" open>
      <summary>{t('location-title',{category})}</summary>
      <div className="location-summary-content">
        <p>{marker ? markerDescription(marker,locale).trim() || t('location-empty') : t('location-unavailable')}</p>
        <Link href={localePath(locale,'/locations')}>{t('locations-back')}</Link>
      </div>
    </details>
    <main className="map-main"><MapView markerId={markerId} /></main>
  </>;
}
