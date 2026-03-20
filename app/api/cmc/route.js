export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols') || 'BTC,ETH,SOL,BNB'

    const res = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=USD`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
          'Accept': 'application/json',
        },
      }
    )

    if (!res.ok) throw new Error(`CMC error: ${res.status}`)

    const json = await res.json()

    const result = {}
    Object.entries(json.data || {}).forEach(([symbol, info]) => {
      const q = info.quote?.USD
      result[symbol] = {
        price:     q?.price?.toFixed(2),
        change1h:  q?.percent_change_1h?.toFixed(2),
        change24h: q?.percent_change_24h?.toFixed(2),
        change7d:  q?.percent_change_7d?.toFixed(2),
        volume24h: q?.volume_24h?.toFixed(0),
        marketCap: q?.market_cap?.toFixed(0),
        dominance: q?.market_cap_dominance?.toFixed(2),
        rank:      info.cmc_rank,
        name:      info.name,
      }
    })

    return Response.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      },
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
