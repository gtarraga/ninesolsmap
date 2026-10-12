'use client';
import dynamic from 'next/dynamic';
import { LoadingScreen } from './LoadingScreen';
const Map = dynamic(() => import('./Map'), {ssr:false, loading:() => <LoadingScreen />});

/** Keep Leaflet in the browser while location notes render on the server. */
export function MapView({markerId}:{markerId?:string}) {
  return <Map markerId={markerId} />;
}
