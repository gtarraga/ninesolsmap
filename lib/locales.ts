/** Languages supported by the map and its public sharing URLs. */
export const locales = ['en', 'zh-CN', 'zh-TW'] as const;
/** A supported map language. */
export type Locale = typeof locales[number];
/** Narrow a route parameter to a supported language. */
export function isLocale(value: unknown): value is Locale {
  return locales.some(locale => locale === value);
}

/** Public URLs omit the English prefix while preserving both Chinese prefixes. */
export function localePath(locale: Locale, path: string = ''): string {
  const suffix = path === '/' ? '' : path;
  return locale === 'en' ? suffix || '/' : `/${locale}${suffix}`;
}

/** Keep canonical and language alternatives consistent with public navigation. */
export function pageAlternates(locale: Locale, path: string = '') {
  return {canonical:localePath(locale,path),languages:{
    ...Object.fromEntries(locales.map(language=>[language,localePath(language,path)])),
    'x-default':localePath('en',path),
  }};
}
