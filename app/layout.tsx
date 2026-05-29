// app/layout.tsx
import { AppProvider } from '@/context/AppContext';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = {
  title: 'Gulf Labor - Find Workers & Jobs',
  description: 'Find skilled workers and job opportunities across Gulf countries',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProvider initialCountry="qa">
          {children}
        </AppProvider>
      </body>
    </html>
  );
}