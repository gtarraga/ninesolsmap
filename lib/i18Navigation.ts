import { createSharedPathnamesNavigation } from 'next-intl/navigation';

import { locales } from './locales';

/** Locale-aware navigation that preserves marker sharing paths. */
export const { usePathname, useRouter } = createSharedPathnamesNavigation({
  locales: locales,
});