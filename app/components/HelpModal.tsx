'use client';
import { useRef } from 'react';
import { CircleHelp, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Native modal supplies keyboard focus, escape handling and a scrollable help body. */
export default function HelpModal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const t = useTranslations();
  return <>
    <button className="tool-button" onClick={()=>dialog.current?.showModal()} aria-label={t('help')} title={t('help')}><CircleHelp size={22} aria-hidden="true" /></button>
    <dialog ref={dialog} className="help-dialog" aria-labelledby="help-title" onClick={event=>{
      if (event.target === event.currentTarget) dialog.current?.close();
    }}>
      <div className="dialog-heading"><h2 id="help-title">{t('help-title')}</h2><button className="tool-button" onClick={()=>dialog.current?.close()} aria-label={t('close')}><X size={22} aria-hidden="true" /></button></div>
      <div className="help-copy"><p>{t('help-1')}</p><p>{t('help-2')}</p><p>{t('help-3')}</p></div>
    </dialog>
  </>;
}
