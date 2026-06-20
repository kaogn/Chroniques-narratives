import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mémoires Humaines - Le Jeu de la Mémoire Collective',
  description: 'Vivez l\'histoire à travers la mémoire collective de l\'humanité. Choisissez quelles technologies préserver à travers les âges.',
  keywords: ['jeu', 'histoire', 'technologie', 'civilisation', 'mémoire', 'fiction interactive'],
  authors: [{ name: 'Équipe Mémoires Humaines' }],
  creator: 'Mémoires Humaines',
  openGraph: {
    title: 'Mémoires Humaines',
    description: 'Vivez l\'histoire à travers la mémoire collective de l\'humanité',
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased bg-black min-h-screen font-inter overflow-x-hidden"
        suppressHydrationWarning
      >
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/30" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,119,198,0.15),transparent_50%)]" />

        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}