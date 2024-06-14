"use client";

import dynamic from "next/dynamic";
import { LoadingScreen } from "@/app/components/LoadingScreen";

const MapComponent = dynamic(() => import('@/app/components/Map'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Home() {
  return (
    <main>
      <MapComponent />;
    </main>
  );
}