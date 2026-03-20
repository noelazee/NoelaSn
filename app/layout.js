import './globals.css'

export const metadata = {
  title: 'SniperBot — AI Crypto Trading Platform',
  description: 'Sniper-level AI trading assistant for BTC, ETH, SOL, BNB. Multi-exchange, multi-strategy.',
  keywords: ['crypto', 'trading', 'bitcoin', 'ethereum', 'AI', 'sniper'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
