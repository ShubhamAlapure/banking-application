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
  title: 'Apex Trust Bank | Premier Digital & Commercial Banking',
  description:
    'Apex Trust Bank offers premier personal and corporate banking, high-yield digital savings, instant wire transfers, and enterprise-grade security.',
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
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col text-slate-900 selection:bg-indigo-600 selection:text-white font-sans"
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
