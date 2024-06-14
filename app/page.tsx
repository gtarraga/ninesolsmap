"use client";

import dynamic from "next/dynamic";
import { LoadingScreen } from "@/components/LoadingScreen";

const MapComponent = dynamic(() => import('@/components/Map'), {
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