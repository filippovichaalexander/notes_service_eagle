import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Приложение для управления заметками',
  description: 'Управление заметками',
  generator: 'notes.app',
  icons: {
    icon: [
      {
        url: 'https://placehold.co/32x32?text=L',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: 'https://placehold.co/32x32?text=D',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: 'https://placehold.co/64x64?text=NA',
        type: 'image/svg+xml',
      },
    ],
    apple: 'https://placehold.co/180x180?text=NA',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
