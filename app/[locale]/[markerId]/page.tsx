'use client';
import dynamic from 'next/dynamic';
import { LoadingScreen } from '@/app/components/LoadingScreen';
const MapComponent = dynamic(()=>import('@/app/components/Map'),{ssr:false,loading:()=> <LoadingScreen />});

/** Open a shared marker while preserving the normal map layout. */
export default function MapPage({params}:{params:{markerId:string}}) {
  return <main className="map-main"><MapComponent markerId={params.markerId} /></main>;
}
