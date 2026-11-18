import type { Metadata, Viewport } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
import './globals.css';

const serif = Playfair_Display({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Velvet Vine · Wine boutique in Ventura, California', template: '%s · Velvet Vine' },
  description: 'Velvet Vine is an intimate wine boutique at 6381 Cherry Lane, Ventura, CA. Browse the wine collection online and visit in store. No online sales, shipping or delivery.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#F5F0E7' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
