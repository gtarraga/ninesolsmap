
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { CSPostHogProvider } from '../providers'
import { Header } from "@/app/components/Header";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { openGraphImages } from '@/lib/opengraphImages';

interface Params {
  params: {
    locale: string;
  };
}

const inter = Inter({ subsets: ["latin"] });
 
export async function generateMetadata({ params: { locale } }: Params) {
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const openGraphImage = openGraphImages[locale] || openGraphImages['en'];

  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL('https://ninesolsmap.com'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      images: [
        {
          url: openGraphImage,
        }
      ],
      locale: locale,
      type: 'website'
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <CSPostHogProvider>
        <body className={inter.className}>
          <NextIntlClientProvider messages={messages}>
            <Header />
            {children}
          </NextIntlClientProvider>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
