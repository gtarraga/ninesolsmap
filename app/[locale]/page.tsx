import { notFound } from 'next/navigation';
import { MapView } from '@/app/components/MapView';
import { isLocale, pageAlternates } from '@/lib/locales';

/** Prefer the clean localized map URL over copies with tracking parameters. */
export function generateMetadata({params:{locale}}:{params:{locale:string}}) {
  if (!isLocale(locale)) notFound();
  return {alternates:pageAlternates(locale)};
}

/** Client-rendered Leaflet map within the responsive application shell. */
export default function Home() { return <main className="map-main"><MapView /></main>; }
