"use client";

import { StyledKofiButton } from "@/components/KofiButton";
import dynamic from "next/dynamic";

const LazyMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  return (
    <main>
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-center">
        {/* <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">

        </nav> */}
        <h2 className="flex-1 text-3xl">Nine Sols Interactive Map</h2>

          <p className="">This is under development but you can still</p>
          <StyledKofiButton />
        
      </header>
      <LazyMap />
    </main>
  );
}
