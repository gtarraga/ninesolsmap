import Script from 'next/script';

/** Load AdSense only when configured with a complete publisher ID. */
export default function AdSense({ pId }: { pId?: string }) {
  if (!pId || !/^ca-pub-\d{16}$/.test(pId)) return null;
  return <Script id="adsense" async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
    crossOrigin="anonymous" strategy="afterInteractive" />;
}
