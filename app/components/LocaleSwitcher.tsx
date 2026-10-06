'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Selector';

import { usePathname } from '@/lib/i18Navigation';
import { useLocale } from 'next-intl';
import { locales, isLocale } from '@/lib/locales';
import { useRouter } from '@/lib/i18Navigation';

const languageLabel = {
  en: "EN",
  "zh-CN": "简体",
  "zh-TW": "繁體",
};

const languageName = {
  "en": "English",
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文"
}

/** Compact language menu; full language names remain visible in the dropdown. */
export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const requestedLocale = useLocale();
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en';

  const handleChange = (value: string) => {
    if (isLocale(value)) router.replace(pathname, {locale:value});
  };

  return (
    <Select defaultValue={locale} onValueChange={handleChange}>
      <SelectTrigger aria-label={`Language / 語言: ${languageName[locale]}`} title={languageName[locale]} className="locale-select">
        <SelectValue>{languageLabel[locale]}</SelectValue>
      </SelectTrigger>
      <SelectContent className="language-menu">
        {locales.map((elt) => (
          <SelectItem key={elt} value={elt} className="language-option">
            {languageName[elt]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
