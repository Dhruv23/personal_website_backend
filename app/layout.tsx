import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConfigProvider } from './contexts/ConfigContext';
import { MusicProvider } from './contexts/MusicContext';
import { getConfig } from './actions/config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Adhrin - Portfolio',
  description: 'Embedded software engineer with a passion for creating innovative solutions. Explore my projects, skills, and experience in the world of software development.',
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
            {children}
          </MusicProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
