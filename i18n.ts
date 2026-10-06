import { getRequestConfig } from 'next-intl/server';
import { isLocale } from './lib/locales';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : 'en';
  return { locale, messages: (await import(`./public/messages/${locale}.json`)).default };
});
