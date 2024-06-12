'use client'

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className='h-screen'>Loading...</div>,
});

const MapPage = () => {
  const urlParms = useParams()
  const { markerId } = urlParms;

  return <MapComponent markerId={markerId as string} />;
};

export default MapPage;
