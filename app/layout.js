import './globals.css'

export const metadata = {
  title: 'NOELA — Sniper Trading & News Curation',
  description: 'AI-powered sniper trading for crypto + agent curation of verified news. Precision over frequency. Earn NEWS tokens by curating.',
  keywords: ['crypto', 'trading', 'sniper', 'news', 'curation', 'agents', 'world-chain'],
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
