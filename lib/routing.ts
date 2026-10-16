import { locales } from './locales';

/** URL language is explicit; browser preferences cannot redirect the English root. */
export const routing = {
  locales,
  defaultLocale:'en',
  localePrefix:'as-needed',
  localeDetection:false,
  localeCookie:false,
} as const;
