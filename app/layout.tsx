import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConfigProvider } from './contexts/ConfigContext';
import { MusicProvider } from './contexts/MusicContext';
import { getConfig } from './actions/config';
import { CustomCursor } from './components/CustomCursor';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Adhrin - Portfolio',
  description: 'Full-stack Developer & UI/UX Designer',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialConfig = await getConfig();

  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider initialConfig={initialConfig}>
          <MusicProvider>
            <CustomCursor />
            {children}
          </MusicProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
