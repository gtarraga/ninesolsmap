import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale, localePath, pageAlternates } from '@/lib/locales';

/** Localized metadata for the site's privacy disclosures. */
export async function generateMetadata({params:{locale}}:{params:{locale:string}}) {
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({locale});
  return {title:`${t('privacy-title')} · ${t('short-title')}`, description:t('privacy-intro'),
    alternates:pageAlternates(locale,'/privacy')};
}

/** Describe the current services and tracking without claiming that future ads are active. */
export default async function PrivacyPage({params:{locale}}:{params:{locale:string}}) {
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({locale});
  return <main className="about-main"><article className="about-content">
    <h1>{t('privacy-title')}</h1><p className="page-meta">{t('privacy-updated')}</p>
    <p>{t('privacy-intro')}</p>
    {['analytics','hosting','ads','choices'].map(section => <section key={section}>
      <h2>{t(`privacy-${section}-title`)}</h2><p>{t(`privacy-${section}`)}</p>
    </section>)}
    <nav className="about-links" aria-label={t('privacy')}>
      <a href="https://posthog.com/privacy">{t('privacy-posthog')}</a>
      <a href="https://policies.google.com/privacy">{t('privacy-google')}</a>
      <a href="https://github.com/gtarraga/ninesolsmap/issues">{t('about-issue-link')}</a>
    </nav>
    <div className="about-back"><Link href={localePath(locale,'/about')}>← {t('about')}</Link></div>
  </article></main>;
}
