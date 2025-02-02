import { Inter } from "next/font/google";
import "@/app/globals.css";
import { CSPostHogProvider } from "./providers";
import { Header } from "@/app/components/Header";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { openGraphImages } from "@/lib/opengraphImages";
import AdSense from "./components/AdSense";

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html>
      <CSPostHogProvider>
        <head>
          <AdSense pId="ca-pub-1640535171105894" />
        </head>
        <body className={inter.className}>{children}</body>
      </CSPostHogProvider>
    </html>
  );
}
