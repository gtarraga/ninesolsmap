"use client";
import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

/** Initialize analytics on the live site, keeping local and preview traffic out. */
export function CSPostHogProvider({children}:{children:React.ReactNode}) {
  useEffect(()=>{
    const isLiveSite = ['ninesolsmap.com', 'www.ninesolsmap.com'].includes(window.location.hostname);
    if (!isLiveSite || posthog.__loaded) return;
    posthog.init('phc_vqdisUw3HGLh6ZmLWjR56DbSJCgup5pCbZXq5JeqA4bN', {
      api_host: 'https://eu.i.posthog.com',
      defaults: '2026-05-30',
      person_profiles: 'identified_only',
    });
  },[]);
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
