import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { PWAPrompt } from '@/components/pwa-prompt';
import { CuratorPlayerCard } from '@/components/curator-player';
import { ClientLayout } from '@/components/client-layout'; // Assuming ClientLayout is defined in this file

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Music Curator',
  description: 'A mobile-first music curation app',
  manifest: '/manifest.json',
  themeColor: '#2B1B54',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Music Curator',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  icons: {
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <main className="min-h-screen pb-24">
            <ClientLayout>{children}</ClientLayout>
          </main>
          <CuratorPlayerCard />
          <Toaster />
          <PWAPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}