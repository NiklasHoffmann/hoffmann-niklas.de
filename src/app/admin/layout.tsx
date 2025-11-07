import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
    title: 'Admin Dashboard | Niklas Hoffmann',
    description: 'Admin panel for managing website content and interactions',
    robots: 'noindex, nofollow', // Don't index admin pages
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
        >
            {children}
        </ThemeProvider>
    );
}
