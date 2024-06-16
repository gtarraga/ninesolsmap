import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { CSPostHogProvider } from '../providers'
import { Header } from "@/app/components/Header";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nine Sols Interactive Map",
  description: "To save you time finding that last item in an area.\n\nAn interactive map for Nine Sols with all items, map chips, bosses and more!",
  metadataBase: new URL('https://ninesolsmap.com'),
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
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
