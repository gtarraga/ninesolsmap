import { Inter } from "next/font/google";
import "@/app/globals.css";
import { CSPostHogProvider } from "./providers";
import AdSense from "./components/AdSense";

const inter = Inter({ subsets: ["latin"] });

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
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
