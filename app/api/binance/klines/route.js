'use server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const interval = searchParams.get('interval') || '15m';
    const limit = searchParams.get('limit') || '100';

    console.log('[v0] Fetching klines for', symbol, interval);

    // Fetch from Binance backend (no CORS issues)
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    
    return Response.json({
      success: true,
      symbol,
      interval,
      klines: data,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=15',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[v0] Binance proxy error:', error.message);
    return Response.json({
      success: false,
      error: error.message,
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
