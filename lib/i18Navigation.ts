import { createSharedPathnamesNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/** Locale-aware navigation that preserves marker sharing paths. */
export const { usePathname } = createSharedPathnamesNavigation(routing);
