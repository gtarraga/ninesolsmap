'use client';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LayerGroup, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useLocale, useTranslations } from 'next-intl';
import { SlidersHorizontal, X } from 'lucide-react';
import { MarkerPopup } from './MarkerPopup';
import { getIcon, getIconClass } from '@/app/utils/getIcons';
import { getCategoryTranslationKey, parseMarkers, type MapMarker } from '@/lib/markers';
import { isLocale } from '@/lib/locales';
import { LoadingScreen } from './LoadingScreen';
import 'leaflet/dist/leaflet.css';

type LoadState = {readonly status:'loading'} | {readonly status:'error'} |
  {readonly status:'ready';readonly markers:ReadonlyArray<MapMarker>};

function MapEvents({onShowAll}:{onShowAll:()=>void}) {
  const map = useMapEvents({click:onShowAll});
  useEffect(()=>{
    const observer = new ResizeObserver(()=>map.invalidateSize());
    observer.observe(map.getContainer());
    return ()=>observer.disconnect();
  },[map]);
  return null;
}

function FocusedMarker({marker,children}:{marker:MapMarker;children:React.ReactNode}) {
  const ref = useRef<L.Marker>(null);
  const map = useMap();
  useEffect(()=>{
    map.setView([marker.x,marker.y],15);
    const timer = setTimeout(()=>ref.current?.openPopup(),100);
    return ()=>clearTimeout(timer);
  },[map,marker]);
  return <Marker ref={ref} icon={getIcon(marker.type)} position={[marker.x,marker.y]}>{children}</Marker>;
}

/** Render a touch-friendly map, category filters and shared marker links. */
export default function MapComponent({markerId}:{markerId?:string}) {
  const [state,setState] = useState<LoadState>({status:'loading'});
  const [attempt,setAttempt] = useState(0);
  const [showAll,setShowAll] = useState(!markerId);
  const [hidden,setHidden] = useState<ReadonlySet<string>>(new Set());
  const dialog = useRef<HTMLDialogElement>(null);
  const requestedLocale = useLocale();
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';
  const t = useTranslations();

  useEffect(()=>{
    const controller = new AbortController();
    setState({status:'loading'});
    const load = async () => {
      try {
        const response = await fetch('/api/markers',{signal:controller.signal});
        if (!response.ok) { if (!controller.signal.aborted) setState({status:'error'}); return; }
        const payload:unknown = await response.json();
        const result = parseMarkers(payload);
        if (!controller.signal.aborted) setState(result._tag === 'ok'
          ? {status:'ready',markers:result.value} : {status:'error'});
      } catch {
        if (!controller.signal.aborted) setState({status:'error'});
      }
    };
    void load();
    return ()=>controller.abort();
  },[attempt]);

  if (state.status === 'loading') return <LoadingScreen />;
  if (state.status === 'error') return <div className="map-status" role="alert"><p>{t('map-error')}</p><button className="action-button" onClick={()=>setAttempt(value=>value+1)}>{t('retry')}</button></div>;

  const grouped = new Map<string,MapMarker[]>();
  for (const marker of state.markers) {
    const group = grouped.get(marker.type) ?? [];
    group.push(marker); grouped.set(marker.type,group);
  }
  const categories = [...grouped];
  const name = (type:string) => {
    const key = getCategoryTranslationKey(type);
    return key && t.has(key) ? t(key) : type;
  };
  categories.sort(([a],[b])=>name(a).localeCompare(name(b),locale));
  const selected = state.markers.find(marker=>marker.id === markerId);
  const focused = !showAll && selected;
  return <div className="map-stage">
    <MapContainer id="map" crs={L.CRS.Simple} center={focused ? [focused.x,focused.y] : [-0.0972900390625,0.443359375]}
      maxBounds={[[0.05,-0.05],[-0.317529296875,1]]} maxBoundsViscosity={0.68}
      zoom={focused ? 15 : 13} minZoom={13} maxZoom={15} scrollWheelZoom attributionControl={false}>
      <TileLayer url="https://map.ninesolsmap.com/map/{z}/{x}/{y}.png" />
      {focused ? <FocusedMarker marker={focused}><MarkerPopup marker={focused} locale={locale} /></FocusedMarker> :
        categories.filter(([type])=>!hidden.has(type)).map(([type,markers])=><LayerGroup key={type}>
          {markers.map(marker=><Marker key={marker.id} icon={getIcon(marker.type)} position={[marker.x,marker.y]}><MarkerPopup marker={marker} locale={locale} /></Marker>)}
        </LayerGroup>)}
      <MapEvents onShowAll={()=>setShowAll(true)} />
    </MapContainer>
    <button className="filter-toggle" onClick={()=>dialog.current?.showModal()} aria-label={t('filters')}><SlidersHorizontal size={20} aria-hidden="true" /><span>{t('filters')}</span></button>
    {markerId && !showAll && <button className="show-all action-button" onClick={()=>setShowAll(true)}>{selected ? t('show-all') : t('marker-missing')}</button>}
    <dialog ref={dialog} className="filter-dialog" aria-labelledby="filter-title" onClick={event=>{if(event.target === event.currentTarget) dialog.current?.close();}}>
      <div className="dialog-heading"><h2 id="filter-title">{t('filters')}</h2><button className="tool-button" onClick={()=>dialog.current?.close()} aria-label={t('close')}><X size={22} aria-hidden="true" /></button></div>
      <div className="filter-actions"><button onClick={()=>setHidden(new Set())}>{t('select-all')}</button><button onClick={()=>setHidden(new Set(categories.map(([type])=>type)))}>{t('hide-all')}</button></div>
      <div className="filter-list">{categories.map(([type,markers])=><label className="filter-row" key={type}>
        <input type="checkbox" checked={!hidden.has(type)} onChange={()=>setHidden(current=>{
          const next = new Set(current); if(next.has(type)) next.delete(type); else next.add(type); return next;
        })} /><span className="filter-icon" aria-hidden="true"><span className={getIconClass(type)} /></span><span>{name(type)}</span><span className="filter-count">{markers.length}</span>
      </label>)}</div>
    </dialog>
  </div>;
}
