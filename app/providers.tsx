"use client";
import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

/** Initialize the shared analytics client only when a project key is configured. */
export function CSPostHogProvider({children}:{children:React.ReactNode}) {
  useEffect(()=>{
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    posthog.init(key, { ...(host ? {api_host:host} : {}), person_profiles:'identified_only' });
  },[]);
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
