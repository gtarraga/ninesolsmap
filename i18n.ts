import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
 
// Define the supported locales type
export type Locale = 'en' | 'zh-CN' | 'zh-TW';

// Array of supported locales
export const locales: Locale[] = ['en', 'zh-CN', 'zh-TW'];


 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: (await import(`@/public/messages/${locale}.json`)).default
  };
});