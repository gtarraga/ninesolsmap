/** Languages supported by the map and its public sharing URLs. */
export const locales = ['en', 'zh-CN', 'zh-TW'] as const;
/** A supported map language. */
export type Locale = typeof locales[number];
/** Narrow a route parameter to a supported language. */
export function isLocale(value: unknown): value is Locale {
  return locales.some(locale => locale === value);
}
