import type { Metadata } from 'next';
import { DM_Sans, DM_Mono, DM_Serif_Display } from 'next/font/google';
import Providers from './providers';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});
const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Resume Tailor',
  description:
    'Tailor your resume to any job description while preserving your .docx layout — fonts, spacing, and columns intact.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable} ${dmSerif.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
