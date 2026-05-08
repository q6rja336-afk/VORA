import type { Metadata, Viewport } from 'next';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vora.tv';

export const metadata: Metadata = {
  title: {
    default: 'VORA — منصة البث المتميز',
    template: '%s | VORA',
  },
  description: 'اكتشف أفضل الأفلام والمسلسلات العالمية على VORA — منصة البث المتميز التي تعيد تعريف تجربة المشاهدة.',
  keywords: ['VORA', 'بث', 'أفلام', 'مسلسلات', 'streaming', 'movies', 'series'],
  metadataBase: new URL(APP_URL),
  manifest: '/manifest.json',

  // ── Favicon & Icons ──────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },

  // ── Open Graph (مشاركة الرابط) ───────────────────────────────────────────
  openGraph: {
    title: 'VORA — منصة البث المتميز',
    description: 'اكتشف أفضل الأفلام والمسلسلات العالمية على VORA. تجربة مشاهدة سينمائية لا مثيل لها.',
    url: APP_URL,
    siteName: 'VORA',
    type: 'website',
    locale: 'ar_SA',
    images: [
      {
        url: '/og-image.png',   // BG.png — الشعار بخلفية داكنة
        width: 1200,
        height: 630,
        alt: 'VORA — منصة البث المتميز',
        type: 'image/png',
      },
    ],
  },

  // ── Twitter Card ──────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'VORA — منصة البث المتميز',
    description: 'اكتشف أفضل الأفلام والمسلسلات العالمية على VORA.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#12131c',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import { AuthProvider } from '@/context/AuthContext';
import { WatchlistProvider } from '@/context/WatchlistContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* للتأكد من ظهور الصورة عند مشاركة الرابط على واتساب وتويتر وغيرها */}
        <meta property="og:image" content={`${APP_URL}/og-image.png`} />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
      </head>
      <body>
        <WatchlistProvider>
          {children}
        </WatchlistProvider>
      </body>
    </html>
  );
}
