'use client';
import dynamic from 'next/dynamic';
import { LoadingScreen } from '@/app/components/LoadingScreen';
const MapComponent = dynamic(()=>import('@/app/components/Map'),{ssr:false,loading:()=> <LoadingScreen />});

/** Client-rendered Leaflet map within the responsive application shell. */
export default function Home() { return <main className="map-main"><MapComponent /></main>; }
