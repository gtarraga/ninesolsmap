import { Popup } from "react-leaflet";
import { DataItem } from "./Map"
import {useTranslations} from 'next-intl';

interface MarkerPopupProps {
  marker: DataItem;
  locale: string;
}

const language: Record<string, keyof DataItem> = {
  'en': 'description',
  'zh-TW': 'traditional',
  'zh-CN': 'simplified',
};

const baseUrl = "https://ninesolsmap.com";


export const MarkerPopup: React.FC<MarkerPopupProps> = ({marker, locale}) => {
  const t = useTranslations();
  
  return (
    <Popup minWidth={200}>
      <div className='min-w-12'>
        <div className='py-2 text-[0.95rem]'>{marker[language[locale]]}</div>
        
        <hr className='py-1'/>

        <div className="flex justify-between">
          <div className="text-slate-400/70">id: <span className='italics text-xs'>{marker.id}</span></div>
          
          <button 
            className={` share-button bg-emerald-300 hover:bg-emerald-400 text-slate-800 hover:text-slate-800 font-bold py-0.4 px-1 rounded inline-flex items-center justify-between`}
            onClick={() => {
                navigator.clipboard.writeText(`${baseUrl}/${locale}/${marker.id}`);
              }}
            >
            <span className="text-xs pr-1">{t('copy-url')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
          </button>
        </div>
      </div>
    </Popup>
  )
}