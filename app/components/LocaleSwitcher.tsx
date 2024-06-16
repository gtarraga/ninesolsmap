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
import { locales, Locale } from '@/i18n';
import { useRouter } from 'next/navigation';

const languageName = {
  "en": "English",
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文"
}

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;

  const handleChange = (value: string) => {
    router.replace(`/${value}/${pathname}`);
  };

  return (
    <Select defaultValue={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[110px] border-transparent hover:border-black dark:hover:border-white rounded">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent className='bg-[#d6dbdc] dark:bg-black border-black'>
        {locales.map((elt) => (
          <SelectItem key={elt} value={elt} className='hover:bg-gray-400 dark:hover:bg-gray-600'>
            {languageName[elt]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
