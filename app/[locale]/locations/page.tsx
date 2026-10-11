import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/locales';
import { getCategoryTranslationKey, type MapMarker } from '@/lib/markers';
import { markerDescription, readPageMarkers } from '@/lib/page-markers';

/** Keep the directory live rather than caching an upstream failure at build time. */
export const dynamic = 'force-dynamic';

/** Localized search metadata for the readable marker directory. */
export async function generateMetadata({params:{locale}}:{params:{locale:string}}) {
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({locale});
  return {title:`${t('locations-title')} · ${t('short-title')}`,description:t('locations-intro'),
    alternates:{canonical:`/${locale}/locations`}};
}

/** Expose existing curated location notes and map links without requiring JavaScript. */
export default async function LocationsPage({params:{locale}}:{params:{locale:string}}) {
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({locale});
  const result = await readPageMarkers();
  const groups = new Map<string,MapMarker[]>();
  if (result._tag === 'ok') for (const marker of result.value) {
    const group = groups.get(marker.type) ?? [];
    group.push(marker); groups.set(marker.type,group);
  }
  const categoryName = (type:string) => {
    const key = getCategoryTranslationKey(type);
    return key && t.has(key) ? t(key) : type;
  };
  const categories = [...groups].sort(([a],[b]) => categoryName(a).localeCompare(categoryName(b),locale));
  return <main className="about-main"><article className="about-content locations-content">
    <h1>{t('locations-title')}</h1><p>{t('locations-intro')}</p>
    {result._tag === 'err' ? <p role="alert">{t('location-unavailable')}</p> : <>
      <nav className="category-links" aria-label={t('filters')}>{categories.map(([type,markers]) =>
        <a href={`#${encodeURIComponent(type)}`} key={type}>{categoryName(type)} <span>{markers.length}</span></a>)}</nav>
      {categories.map(([type,markers]) => <section key={type} id={type}>
        <h2>{categoryName(type)} <span className="page-meta">{markers.length}</span></h2>
        <ul className="location-list">{markers.map(marker => <li key={marker.id}>
          <Link href={`/${locale}/${encodeURIComponent(marker.id)}`}>
            {markerDescription(marker,locale).trim() || t('location-empty')}
            <span className="location-ref">{t('location-reference',{id:marker.id})}</span>
          </Link>
        </li>)}</ul>
      </section>)}
    </>}
    <nav className="about-links"><Link href={`/${locale}/about`}>{t('about')}</Link><Link href={`/${locale}/privacy`}>{t('privacy')}</Link><Link href={`/${locale}`}>{t('back-to-map')}</Link></nav>
  </article></main>;
}
