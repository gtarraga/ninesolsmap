import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin('./i18n.ts');
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{source:'/en/:path*',destination:'/:path*',permanent:true}];
  },
  async headers() {
    return [{ source: '/sprites/:path*', headers: [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ] }];
  },
};
 
export default withNextIntl(nextConfig);
