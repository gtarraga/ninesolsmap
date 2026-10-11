import type { MetadataRoute } from 'next';

/** Allow crawlers to access both readable pages and assets needed to render the map. */
export default function robots(): MetadataRoute.Robots {
  return {rules:{userAgent:'*',allow:'/'},sitemap:'https://ninesolsmap.com/sitemap.xml'};
}
