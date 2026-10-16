import type { MetadataRoute } from 'next';
import { locales, localePath } from '@/lib/locales';
import { readPageMarkers } from '@/lib/page-markers';

/** Avoid publishing a permanently incomplete sitemap when marker data is unavailable at build time. */
export const dynamic = 'force-dynamic';

/** List the actual localized map, informational pages and existing shared marker URLs. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = await readPageMarkers();
  const paths = ['', '/about', '/privacy', '/locations',
    ...(result._tag === 'ok' ? result.value.map(marker=>`/${encodeURIComponent(marker.id)}`) : [])];
  return locales.flatMap(locale => paths.map(path => ({url:`https://ninesolsmap.com${localePath(locale,path)}`,
    alternates:{languages:Object.fromEntries(locales.map(language=>[language,`https://ninesolsmap.com${localePath(language,path)}`]))}})));
}
