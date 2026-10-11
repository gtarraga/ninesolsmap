import 'server-only';
import { cache } from 'react';
import { loadPublicMarkers } from './supabase/public-markers';
import type { MapMarker } from './markers';
import type { Locale } from './locales';

/** Reuse one anonymous read within a server render and its metadata generation. */
export const readPageMarkers = cache(() => loadPublicMarkers({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}));

/** Choose the same translated note displayed by the interactive map. */
export function markerDescription(marker: MapMarker, locale: Locale): string {
  return locale === 'zh-CN' ? marker.simplified : locale === 'zh-TW' ? marker.traditional : marker.description;
}
