async function sendTelegram(type, data) {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    await fetch(`${base}/api/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    })
  } catch {}
}

async function pollJob(jobId) {
  const maxAttempts = 20
  const interval = 1500
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, interval))
    try {
      const res = await fetch(`https://api.bankr.bot/agent/job/${jobId}`, {
        headers: { 'X-API-Key': process.env.BANKR_API_KEY },
      })
      const data = await res.json()
      if (data.status === 'completed' || data.status === 'failed') return data
    } catch {}
  }
  return { status: 'timeout', response: 'Job timed out. Check Bankr dashboard.' }
}

export async function POST(req) {
  const { prompt, readOnly, meta } = await req.json()

  const res = await fetch('https://api.bankr.bot/agent/prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.BANKR_API_KEY,
    },
    body: JSON.stringify({ prompt, readOnly }),
  })

  const data = await res.json()

  if (!data.success) {
    return Response.json({ error: data.message || 'Bankr request failed.' }, { status: res.status })
  }

  const result = await pollJob(data.jobId)

  if (!readOnly && result.status === 'completed' && meta) {
    if (meta.type === 'order') {
      await sendTelegram('order_filled', {
        pair: meta.pair,
        action: meta.action,
        entry: meta.entry,
        sl: meta.sl,
        tp1: meta.tp1,
        tp2: meta.tp2,
        amount: meta.amount,
        leverage: meta.leverage,
        quality: meta.quality,
      })
    }
    if (meta.type === 'tp_hit') {
      await sendTelegram('tp_hit', {
        pair: meta.pair,
        tp: meta.tp,
        pnl: meta.pnl,
        action: meta.action,
      })
    }
    if (meta.type === 'sl_hit') {
      await sendTelegram('sl_hit', {
        pair: meta.pair,
        sl: meta.sl,
        loss: meta.loss,
      })
    }
  }

  return Response.json({
    success: result.status === 'completed',
    response: result.response || result.message || 'Done.',
    status: result.status,
    jobId: data.jobId,
    threadId: data.threadId,
  })
}
