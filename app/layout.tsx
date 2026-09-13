import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Huncho Tech Studio — AI Live Video Edits',
  description: 'Realtime AI video editing powered by Lucy 2.5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-white antialiased">{children}</body>
    </html>
  );
}
