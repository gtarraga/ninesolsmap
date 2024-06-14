import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CSPostHogProvider } from './providers'
import { Header } from "@/app/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nine Sols Interactive Map",
  description: "To save you time finding that last item in an area.\n\nAn interactive map for Nine Sols with all items, map chips, bosses and more!",
  metadataBase: new URL('https://ninesolsmap.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <CSPostHogProvider>
        <body className={inter.className}>
          <Header />
          {children}
        </body>
      </CSPostHogProvider>
    </html>
  );
}
