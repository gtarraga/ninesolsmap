'use client'

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { LoadingScreen } from '@/app/components/LoadingScreen';

const MapComponent = dynamic(() => import('@/app/components/Map'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

const MapPage = () => {
  const urlParms = useParams()
  const { markerId } = urlParms;

  return <MapComponent markerId={markerId as string} />;
};

export default MapPage;
