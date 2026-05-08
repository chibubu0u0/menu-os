import type { Metadata } from 'next'
import './globals.css'

const restaurantName = process.env.NEXT_PUBLIC_RESTAURANT_NAME || 'Menu OS'

export const metadata: Metadata = {
  title: `${restaurantName} | Menu`,
  description: 'A clean restaurant menu management website powered by Next.js and Supabase.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  )
}
