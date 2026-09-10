import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sharpen The Edge - Bus Booking | 2026 National Convention',
  description: 'Book your bus seat for the Sharpen The Edge 2026 National Convention in Hyderabad.',
  openGraph: {
    title: 'Sharpen The Edge - Bus Booking',
    description: 'Reserve your bus seat for the 2026 National Convention in Hyderabad.',
    images: ['/images/sharpen-banner.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
