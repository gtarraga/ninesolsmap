import { Inter } from 'next/font/google';
import '@/app/globals.css';
import '@/app/sprites.css';
import { CSPostHogProvider } from '../providers';
import { Header } from '@/app/components/Header';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/locales';
import { openGraphImages } from '@/lib/opengraphImages';
import AdSense from '../components/AdSense';
import { AdBanner } from '@/app/components/AdBanner';

const inter = Inter({ subsets:['latin'] });

/** Localized metadata for the map and marker share pages. */
export async function generateMetadata({ params:{locale} }: { params:{locale:string} }) {
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({locale,namespace:'Metadata'});
  return { title:t('title'), description:t('description'),
    metadataBase:new URL('https://ninesolsmap.com'),
    openGraph:{title:t('title'), description:t('description'),
      images:[{url:openGraphImages[locale]}], locale} };
}

/** Single document shell with localized map controls. */
export default async function LocaleLayout({children,params:{locale}}:
  {children:React.ReactNode;params:{locale:string}}) {
  if (!isLocale(locale)) notFound();
  const messages = await getMessages();
  const adPreview = process.env.ADSENSE_LOCAL_PREVIEW === '1';
  const adBanner = adPreview || process.env.VERCEL_ENV === 'production';
  return <html lang={locale}>
    <body className={inter.className}>
      <CSPostHogProvider>
        {!adBanner && <AdSense pId={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID} />}
        <NextIntlClientProvider messages={messages}>
          <div className="app-shell"><Header />{adBanner ? <AdBanner preview={adPreview}>{children}</AdBanner> : children}</div>
        </NextIntlClientProvider>
      </CSPostHogProvider>
    </body>
  </html>;
}
