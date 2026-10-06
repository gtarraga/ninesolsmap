import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/locales';

/** Give the public About route its own localized search and sharing metadata. */
export async function generateMetadata({params:{locale}}:{params:{locale:string}}) {
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({locale});
  const title = `${t('about-title')} · ${t('short-title')}`;
  return {title, description:t('about-description'),
    openGraph:{title, description:t('about-description'), url:`/${locale}/about`}};
}

/** Concise project information and usage guidance, readable without loading the map. */
export default async function AboutPage({params:{locale}}:{params:{locale:string}}) {
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({locale});
  return <main className="about-main">
    <article className="about-content">
      <h1>{t('about-title')}</h1>
      <p>{t('about-description')}</p>
      <h2>{t('about-use-title')}</h2>
      <p>{t('about-use')}</p>
      <h2>{t('about-corrections-title')}</h2>
      <p>{t('about-corrections')}</p>
      <a href="https://github.com/gtarraga/ninesolsmap/issues">{t('about-issue-link')}</a>
      <h2>{t('about-support-title')}</h2>
      <p>{t('about-support')}</p>
      <a href="https://ko-fi.com/gtarraga">{t('kofi-button')}</a>
      <div className="about-back"><Link href={`/${locale}`}>← {t('back-to-map')}</Link></div>
    </article>
  </main>;
}
