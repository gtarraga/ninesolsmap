import KofiButton from "kofi-button"
import { useTranslations } from "next-intl"

export const StyledKofiButton = () => {
  const t = useTranslations()
  return (
    <KofiButton color="#00bfa5" title={t("kofi-button")} kofiID="gtarraga" />
  )
}