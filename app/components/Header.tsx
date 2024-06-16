'use client'

import { StyledKofiButton } from "./KofiButton"
import HelpModal from "./HelpModal"
import { useTranslations } from 'next-intl';
import LocaleSwitcher from "./LocaleSwitcher";

export const Header = () => {
  const t = useTranslations();
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-center">
      <h2 className="flex-1 text-3xl">{t('title')}</h2>

      <LocaleSwitcher />
      <HelpModal />
      <StyledKofiButton />
    </header>
  )
}