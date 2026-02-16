import type { Metadata } from 'next';
import './globals.css';
import { StructuredData } from '@/components/features/StructuredData';

export const metadata: Metadata = {
  title: 'React Re-render Simulator – Visualize and Optimize React Component Renders',
  description: 'Visualize and optimize React component re-renders with static analysis and rule-based simulation. Learn React performance best practices.',
  keywords: ['React', 're-render', 'performance', 'optimization', 'component', 'simulator'],
  authors: [{ name: 'React Re-render Simulator' }],
  creator: 'React Re-render Simulator',
  publisher: 'React Re-render Simulator',
  metadataBase: new URL('https://react-rerender-simulator.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'React Re-render Simulator – Visualize and Optimize React Component Renders',
    description: 'Visualize and optimize React component re-renders with static analysis and rule-based simulation.',
    url: 'https://react-rerender-simulator.com',
    siteName: 'React Re-render Simulator',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'React Re-render Simulator – Visualize and Optimize React Component Renders',
    description: 'Visualize and optimize React component re-renders with static analysis and rule-based simulation.',
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
