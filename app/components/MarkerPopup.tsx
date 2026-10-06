import { useEffect, useRef, useState } from 'react';
import { Popup } from 'react-leaflet';
import { useTranslations } from 'next-intl';
import { Share2 } from 'lucide-react';
import type { MapMarker } from '@/lib/markers';
import type { Locale } from '@/lib/locales';

/** Show the localized description and report clipboard success or failure. */
export function MarkerPopup({marker,locale}:{marker:MapMarker;locale:Locale}) {
  const t = useTranslations();
  const [copy,setCopy] = useState<'idle'|'copied'|'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const description = locale === 'zh-CN' ? marker.simplified : locale === 'zh-TW' ? marker.traditional : marker.description;
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`https://ninesolsmap.com/${locale}/${encodeURIComponent(marker.id)}`);
      setCopy('copied');
    } catch { setCopy('failed'); }
    clearTimeout(timer.current);
    timer.current = setTimeout(()=>setCopy('idle'),2500);
  };
  return <Popup minWidth={200} maxWidth={280}>
    <p className="marker-description">{description}</p>
    <div className="popup-footer"><span className="marker-id">id: {marker.id}</span><button className="share-button" onClick={()=>void share()}><Share2 size={16} aria-hidden="true" /><span>{copy === 'copied' ? t('copied') : t('copy-url')}</span></button></div>
    <span role="status" className={copy === 'failed' ? 'copy-error' : 'sr-only'}>{copy === 'failed' ? t('copy-error') : copy === 'copied' ? t('copied') : ''}</span>
  </Popup>;
}
