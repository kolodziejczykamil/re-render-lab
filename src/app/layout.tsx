import type { Metadata } from 'next';
import './globals.css';
import { StructuredData } from '@/components/features/StructuredData';

export const metadata: Metadata = {
  title: 'React Re-render Simulator – Analyze and Optimize React Component Performance',
  description: 'Free React Re-render Simulator. Analyze why your React component re-renders, detect avoidable renders, and improve performance instantly.',
  keywords: ['React', 're-render', 'performance', 'optimization', 'component', 'simulator', 'React.memo', 'useCallback', 'useMemo'],
  authors: [{ name: 'Kamil Kołodziejczyk' }],
  creator: 'Kamil Kołodziejczyk',
  publisher: 'Kamil Kołodziejczyk',
  metadataBase: new URL('https://react-rerender-simulator.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'React Re-render Simulator – Analyze and Optimize React Component Performance',
    description: 'Free React Re-render Simulator. Analyze why your React component re-renders, detect avoidable renders, and improve performance instantly.',
    url: 'https://react-rerender-simulator.com',
    siteName: 'React Re-render Simulator',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'React Re-render Simulator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'React Re-render Simulator – Analyze and Optimize React Component Performance',
    description: 'Free React Re-render Simulator. Analyze why your React component re-renders, detect avoidable renders, and improve performance instantly.',
    images: ['/og-image.png'],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const stored = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const shouldBeDark = stored ? stored === 'dark' : prefersDark;
                if (shouldBeDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors">
        {children}
      </body>
    </html>
  );
}
