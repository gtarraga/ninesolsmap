"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className='h-screen'>Loading...</div>,
});

export default function Home() {
  return (
    <main>
      <MapComponent />;
    </main>
  );
}