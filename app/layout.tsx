import type {Metadata} from 'next';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';
import './globals.css'; 
import RootLayoutClient from '@/components/RootLayoutClient';
import { ToastProvider } from '@/components/Toast';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
});

export const metadata: Metadata = {
  title: 'IEADTAM - Sistema EBD',
  description: 'Sistema de Agregamento da Escola Bíblica Dominical',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body suppressHydrationWarning className="antialiased min-h-screen flex text-gray-900 bg-[#f4f1eb]">
        <ToastProvider>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </ToastProvider>
      </body>
    </html>
  );
}
