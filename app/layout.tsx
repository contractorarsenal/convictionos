import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ConvictionOS — Trading Performance System',
  description: 'Find your edge. Kill your weaknesses. Built for serious traders.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
