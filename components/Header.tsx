'use client'

import Head from "next/head"
import { StyledKofiButton } from "./KofiButton"

export const Header = () => {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-center">
      <h2 className="flex-1 text-3xl">Nine Sols Interactive Map</h2>
      <p className="">This is under development but you can still</p>
      <StyledKofiButton />
    </header>
  )
}