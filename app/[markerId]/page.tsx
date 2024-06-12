'use client'

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';

const MapComponent = dynamic(() => import('../../components/Map'), {
  ssr: false,
});

const MapPage = () => {
  const urlParms = useParams()
  console.log(urlParms);
  const { markerId } = urlParms;

  // useEffect(() => {
  //   // You can handle any side-effects or initial setup here if needed
  // }, [markerId]);

  return <MapComponent markerId={markerId as string} />;
};

export default MapPage;
