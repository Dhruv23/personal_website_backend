import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConfigProvider } from './contexts/ConfigContext';
import config from '../config.json';
import { CustomCursor } from './components/CustomCursor';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: config.siteMetadata.title,
  description: config.siteMetadata.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider>
            <CustomCursor />
            {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
