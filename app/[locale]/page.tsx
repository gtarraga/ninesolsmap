import { notFound } from 'next/navigation';
import { MapView } from '@/app/components/MapView';
import { isLocale, locales } from '@/lib/locales';

/** Prefer the clean localized map URL over copies with tracking parameters. */
export function generateMetadata({params:{locale}}:{params:{locale:string}}) {
  if (!isLocale(locale)) notFound();
  return {alternates:{canonical:`/${locale}`,
    languages:Object.fromEntries(locales.map(language=>[language,`/${language}`]))}};
}

/** Client-rendered Leaflet map within the responsive application shell. */
export default function Home() { return <main className="map-main"><MapView /></main>; }
