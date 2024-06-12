import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nine Sols Interactive Map",
  description: "To save you time finding that last item in an area.",
  openGraph: {
    title: 'Interactive Map Graphic',
    description: 'A Nine Sols interactive map',
    url: 'https://ninesolsmap.com',
    siteName: 'Nine Sols Interactive Map',
    images: [
      {
        url: './opengraph-image.png',
        height: 636,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
