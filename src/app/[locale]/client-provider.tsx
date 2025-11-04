'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

export function ClientProvider({
    children,
    locale,
}: {
    children: ReactNode;
    locale: string;
}) {
    return (
        <NextIntlClientProvider locale={locale}>
            {children}
        </NextIntlClientProvider>
    );
}
