import './globals.css';
import type { Metadata } from 'next';
import { I18nProvider } from '@/lib/i18n/context';

export const metadata: Metadata = {
  title: 'Orania Squashclub Ladder',
  description: 'Squash ladder management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="af">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
