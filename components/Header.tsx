'use client'

import { StyledKofiButton } from "./KofiButton"
import HelpModal from "./HelpModal"

export const Header = () => {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-center">
      <h2 className="flex-1 text-3xl">Nine Sols Interactive Map</h2>

      <HelpModal />
      <StyledKofiButton />
    </header>
  )
}