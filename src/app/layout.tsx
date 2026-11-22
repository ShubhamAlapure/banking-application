import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { DemoProvider } from '@/context/DemoContext';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/ToastContainer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MIT Payments Bank | India\'s Premier Digital Banking Partner',
  description:
    'MIT Payments Bank offers instant zero-fee transfers, high-yield digital savings, virtual debit cards, and 256-bit bank-grade security.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("color-scheme");var p=window.matchMedia("(prefers-color-scheme: dark)").matches;var d=s==="dark"||(!s&&p);if(s){var m=document.querySelector('meta[name="color-scheme"]');if(m)m.content=s;}if(d){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white font-sans transition-colors duration-200"
      >
        <DemoProvider>
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
          <ToastContainer />
        </DemoProvider>
      </body>
    </html>
  );
}
