import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { DemoProvider } from '@/context/DemoContext';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/ToastContainer';
import { SimulatedSmsInbox } from '@/components/SimulatedSmsInbox';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Apex Trust Bank – Scaling Agile Prototype',
  description: 'Simulated Banking Application for Agile Software Development Final Jury Demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white font-sans">
        <DemoProvider>
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
          <SimulatedSmsInbox />
          <ToastContainer />
        </DemoProvider>
      </body>
    </html>
  );
}
