const HYPERLIQUID_API = 'https://api.hyperliquid.xyz'

export async function POST(request) {
  try {
    const body = await request.json()
    const { action, payload } = body

    if (!action) {
      return Response.json({ error: 'Action required' }, { status: 400 })
    }

    // Get clearinghouse state (account info)
    if (action === 'getAccountState') {
      const res = await fetch(`${HYPERLIQUID_API}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'clearinghouseState',
          user: payload.address,
        }),
      })

      if (!res.ok) {
        return Response.json({ error: 'HL API error' }, { status: res.status })
      }

      const data = await res.json()
      return Response.json({
        success: true,
        data: {
          accountValue: data?.marginSummary?.accountValue || '0',
          totalMarginUsed: data?.marginSummary?.totalMarginUsed || '0',
          totalNtlPos: data?.marginSummary?.totalNtlPos || '0',
          availableMargin: data?.marginSummary?.availableMargin || '0',
        },
      })
    }

    // Get user positions
    if (action === 'getPositions') {
      const res = await fetch(`${HYPERLIQUID_API}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'clearinghouseState',
          user: payload.address,
        }),
      })

      if (!res.ok) {
        return Response.json({ error: 'HL API error' }, { status: res.status })
      }

      const data = await res.json()
      const positions = data?.assetPositions || []
      
      return Response.json({
        success: true,
        positions: positions.map(pos => ({
          asset: pos.asset,
          szi: pos.position?.szi || '0',
          leverage: pos.position?.leverage || {},
          marginUsed: pos.position?.marginUsed || '0',
        })),
      })
    }

    // Get metadata (symbols, prices)
    if (action === 'getMetadata') {
      const res = await fetch(`${HYPERLIQUID_API}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
      })

      if (!res.ok) {
        return Response.json({ error: 'HL API error' }, { status: res.status })
      }

      const data = await res.json()
      return Response.json({
        success: true,
        assets: data?.[0] || [],
      })
    }

    // Get open orders
    if (action === 'getOpenOrders') {
      const res = await fetch(`${HYPERLIQUID_API}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'openOrders',
          user: payload.address,
        }),
      })

      if (!res.ok) {
        return Response.json({ error: 'HL API error' }, { status: res.status })
      }

      const orders = await res.json()
      return Response.json({
        success: true,
        orders: orders || [],
      })
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('[v0] Hyperliquid API error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
