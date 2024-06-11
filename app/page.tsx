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
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 text-right">
        {/* <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">

        </nav> */}
        <p>This is under development but you can still</p>
        <StyledKofiButton />
        <p>I am planning to have finished by the end of the week.</p>
        
      </header>
      <LazyMap />
    </main>
  );
}
