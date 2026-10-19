'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import posthog from 'posthog-js';

const publisher = 'ca-pub-1640535171105894';
const slot = '9790698796';

type AdVariant = 'custom' | 'google-anchor';

type AdStatus = 'pending' | 'filled' | 'unfilled' | 'error';
type AdBannerEvent = 'ad_banner_requested' | 'ad_banner_result' | 'ad_banner_failed' | 'ad_banner_shown' | 'ad_banner_dismissed';
type AdProperties = {ad_status:AdStatus;was_shown:boolean;ms_since_shown?:number;failure_stage?:'script'|'initialization'};

function recordAdEvent(event:AdBannerEvent, properties:AdProperties & {ad_request_id:string;ms_since_request:number}) {
  const payload = {ad_variant:'custom',ad_slot:slot,ad_layout:window.innerWidth < 800 ? 'mobile' : 'desktop',...properties};
  if (['ninesolsmap.com','www.ninesolsmap.com'].includes(window.location.hostname)) {
    if (posthog.__loaded) posthog.capture(event,payload);
  } else {
    // A browser-observable preview stream verifies payloads without polluting live analytics.
    window.dispatchEvent(new CustomEvent('ninesolsmap:ad-banner-event',{detail:{event,properties:payload}}));
  }
}

function ResponsiveUnit({onDismiss,preview}:{onDismiss:()=>void;preview:boolean}) {
  const t = useTranslations();
  const element = useRef<HTMLModElement>(null);
  const requested = useRef(false);
  const shownAt = useRef<number|null>(null);
  const adStatus = useRef<AdStatus>('pending');
  const attempt = useRef<{id:string;startedAt:number}|null>(null);
  const requestRecorded = useRef(false);
  const outcomeRecorded = useRef(false);
  const [status,setStatus] = useState('Waiting for Google’s preview ad…');
  const [collapsed,setCollapsed] = useState(false);
  const emit = useCallback((event:AdBannerEvent,properties:AdProperties)=>{
    const current = attempt.current ??= {id:crypto.randomUUID(),startedAt:performance.now()};
    recordAdEvent(event,{...properties,ad_request_id:current.id,ms_since_request:Math.round(performance.now()-current.startedAt)});
  },[]);
  const beginAttempt = useCallback(()=>{
    if (requestRecorded.current) return;
    requestRecorded.current = true;
    emit('ad_banner_requested',{ad_status:'pending',was_shown:false});
  },[emit]);
  const fail = useCallback((stage:'script'|'initialization',message:string)=>{
    adStatus.current = 'error';setStatus(message);setCollapsed(true);
    if (outcomeRecorded.current) return;
    outcomeRecorded.current = true;
    emit('ad_banner_failed',{ad_status:'error',was_shown:false,failure_stage:stage});
  },[emit]);

  useEffect(()=>{
    const node = element.current;
    if (!node) return;
    beginAttempt();
    let visible = false;
    const recordShown = () => {
      if (adStatus.current !== 'filled' || !visible || document.visibilityState !== 'visible' || shownAt.current !== null) return;
      shownAt.current = performance.now();
      emit('ad_banner_shown',{ad_status:'filled',was_shown:true});
    };
    const update = () => {
      if (node.dataset.adStatus === 'filled') { adStatus.current = 'filled';setStatus('Google returned an ad.');setCollapsed(false); }
      if (node.dataset.adStatus === 'unfilled') { adStatus.current = 'unfilled';setStatus('Google returned an empty slot.');setCollapsed(true); }
      if (!outcomeRecorded.current && (adStatus.current === 'filled' || adStatus.current === 'unfilled')) {
        outcomeRecorded.current = true;
        emit('ad_banner_result',{ad_status:adStatus.current,was_shown:false});
      }
      recordShown();
    };
    const observer = new MutationObserver(update);
    observer.observe(node,{attributes:true,attributeFilter:['data-ad-status']});
    const visibility = new IntersectionObserver(entries=>{
      visible = entries.some(entry=>entry.isIntersecting && entry.intersectionRatio >= 0.5);
      recordShown();
    },{threshold:0.5});
    visibility.observe(node);
    document.addEventListener('visibilitychange',recordShown);
    update();
    const timer = window.setTimeout(()=>{
      if (!node.dataset.adStatus) {setStatus('No ad returned yet.');setCollapsed(true);}
    },15000);
    return ()=>{ observer.disconnect();visibility.disconnect();document.removeEventListener('visibilitychange',recordShown);window.clearTimeout(timer); };
  },[beginAttempt,emit]);

  const request = () => {
    if (requested.current || !element.current) return;
    requested.current = true;
    beginAttempt();
    if (!Reflect.get(window,'adsbygoogle')) Reflect.set(window,'adsbygoogle',[]);
    const queue:unknown = Reflect.get(window,'adsbygoogle');
    if (!queue || typeof queue !== 'object' || !('push' in queue) || typeof queue.push !== 'function') {
      fail('initialization','The Google ad loader was unavailable.');return;
    }
    try { queue.push({}); }
    catch { fail('initialization','Google could not initialize the ad.'); }
  };

  const dismiss = () => {
    emit('ad_banner_dismissed',{ad_status:adStatus.current,was_shown:shownAt.current !== null,
      ...(shownAt.current !== null ? {ms_since_shown:Math.round(performance.now()-shownAt.current)} : {})});
    onDismiss();
  };

  return <section hidden={collapsed} className="local-ad-preview" aria-label={preview ? "Local AdSense preview" : "Advertisement"} data-preview-status={status}>
    <style>{`
      .local-ad-preview { flex:none; width:100%; padding:4px 0 max(6px,env(safe-area-inset-bottom)); text-align:center; background:transparent; }
      .local-ad-preview .local-ad-unit { display:block; width:100%; max-width:728px; height:50px; margin:0 auto; background:var(--panel); }
      .local-ad-toolbar { display:flex; align-items:center; justify-content:flex-end; max-width:728px; margin:0 auto; }
      .local-ad-close { display:inline-flex; align-items:center; justify-content:center; min-height:44px; min-width:44px; padding:0 12px; font-size:20px; color:var(--muted); background:transparent; border:0; cursor:pointer; }
      .local-ad-close:hover { color:var(--ink); }
      .local-ad-close:focus-visible { outline:2px solid currentColor; outline-offset:-3px; }
      @media(min-width:800px) { .local-ad-preview .local-ad-unit { height:90px; } }
    `}</style>
    <div className="local-ad-toolbar">
      <button type="button" className="local-ad-close ph-no-capture" onClick={dismiss} aria-label={t('hide-ad-until-reload')} title={t('hide-ad-until-reload')}>
        <span aria-hidden="true">×</span>
      </button>
    </div>
    <ins ref={element} className="adsbygoogle local-ad-unit" data-ad-client={publisher}
      data-ad-slot={slot} data-adtest={preview ? "on" : undefined} />
    <Script id="adsense-banner" async crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`}
      onReady={request} onError={()=>fail('script','Google’s ad script was blocked or could not load.')} />
  </section>;
}

function GoogleBottomAnchor() {
  const requested = useRef(false);
  const capture = useCallback((event:'ad_anchor_requested'|'ad_anchor_failed') => {
    if (posthog.__loaded) posthog.capture(event,{ad_variant:'google-anchor',ad_layout:window.innerWidth < 800 ? 'mobile' : 'desktop'});
  },[]);
  useEffect(()=>{
    if (requested.current) return;
    requested.current = true;
    capture('ad_anchor_requested');
  },[capture]);
  return <Script id="adsense-google-anchor" async crossOrigin="anonymous"
    data-overlays="collapsed-bottom"
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`}
    onError={()=>capture('ad_anchor_failed')} />;
}

/** One browser-stable public ad variant; previews always use the custom unit in test mode. */
export function AdBanner({children,preview}:{children:ReactNode;preview:boolean}) {
  const pathname = usePathname();
  const [allowed,setAllowed] = useState(false);
  const [dismissed,setDismissed] = useState(false);
  const [variant,setVariant] = useState<AdVariant|null>(null);
  const assignment = useRef<AdVariant|null>(null);
  const reported = useRef(false);
  useEffect(()=>{
    const hosts = preview ? ['localhost','127.0.0.1','[::1]'] : ['ninesolsmap.com','www.ninesolsmap.com'];
    setAllowed(hosts.includes(window.location.hostname) || (preview && window.location.hostname.endsWith('.vercel.app')));
  },[preview]);
  useEffect(()=>{
    if (preview) { setVariant('custom');return; }
    if (!allowed) return;
    // Wait for a fresh response instead of using a cached flag on initial load.
    let subscribing = true;
    const unsubscribe = posthog.onFeatureFlags((_flags,_variants,context)=>{
      if (subscribing) return;
      const value = context?.errorsLoading ? false : posthog.getFeatureFlag('ad-banner-enabled');
      // Boolean true supports the previous tester-only flag during deployment migration.
      const next = value === true ? 'custom' : value === 'custom' || value === 'google-anchor' ? value : null;
      if (!next) { setVariant(null);return; }
      // AdSense initializes per document: never swap loader modes without a page reload.
      assignment.current ??= next;
      setVariant(assignment.current);
    });
    subscribing = false;
    const refresh = () => posthog.reloadFeatureFlags();
    refresh();
    const timer = window.setInterval(refresh,60000);
    window.addEventListener('focus',refresh);
    return ()=>{ unsubscribe();window.clearInterval(timer);window.removeEventListener('focus',refresh); };
  },[allowed,preview]);
  const parts = pathname.split('/').filter(Boolean);
  const page = parts[0] === 'zh-CN' || parts[0] === 'zh-TW' ? parts.slice(1) : parts;
  const map = page.length <= 1 && !['about','privacy','locations'].includes(page[0]);
  useEffect(()=>{
    if (!allowed || !variant || !map || preview || reported.current) return;
    reported.current = true;
    posthog.capture('ad_variant_assigned',{ad_variant:variant,ad_layout:window.innerWidth < 800 ? 'mobile' : 'desktop'});
  },[allowed,variant,map,preview]);
  return <>{children}{allowed && variant && map && !dismissed ? variant === 'custom'
    ? <ResponsiveUnit key={pathname} preview={preview} onDismiss={()=>setDismissed(true)} />
    : <GoogleBottomAnchor /> : null}</>;
}
