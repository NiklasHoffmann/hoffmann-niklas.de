'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function LanguageToggle() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleLocaleChange = () => {
        const newLocale = locale === 'de' ? 'en' : 'de';

        // Remove current locale from pathname
        const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

        // Create new path with new locale
        const newPath = `/${newLocale}${pathnameWithoutLocale}`;

        // Get current hash and scroll position
        const currentHash = window.location.hash;
        const currentScrollY = window.scrollY;

        // Use startTransition for smooth update without blinking
        startTransition(() => {
            router.replace(newPath + currentHash, { scroll: false });

            // Restore scroll position after navigation
            setTimeout(() => {
                window.scrollTo(0, currentScrollY);
            }, 0);
        });
    };

    return (
        <button
            onClick={handleLocaleChange}
            disabled={isPending}
            className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors font-medium text-sm disabled:opacity-50"
            aria-label={`Switch to ${locale === 'de' ? 'English' : 'German'}`}
        >
            {locale === 'de' ? '🇬🇧 EN' : '🇩🇪 DE'}
        </button>
    );
}
