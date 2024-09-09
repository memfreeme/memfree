import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['en', 'zh', 'de', 'es', 'fr', 'ja', 'ar'],
    defaultLocale: 'en',
    localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation(routing);
