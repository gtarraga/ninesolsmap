import { createSharedPathnamesNavigation } from 'next-intl/navigation';

import { locales } from '@/i18n';

export const { usePathname, useRouter } = createSharedPathnamesNavigation({
  locales: locales,
});