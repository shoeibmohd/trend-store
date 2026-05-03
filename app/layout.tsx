import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TrendHub UAE - Premium Trending Products',
  description: 'Shop the latest trending fashion, bags, accessories and more. Premium products delivered across all UAE emirates.',
  keywords: 'trendy clothes, bags, accessories, UAE, Dubai, fashion, online shopping',
  openGraph: {
    title: 'TrendHub UAE',
    description: 'Premium trending products delivered across UAE',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
