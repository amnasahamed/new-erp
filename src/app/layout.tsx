import type { Metadata } from 'next';
import Providers from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'ERP Dashboard - Multi-Role System',
  description: 'Multi-role ERP dashboard system for educational institutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
