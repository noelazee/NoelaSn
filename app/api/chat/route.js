import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey:  process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://agentrouter.org/v1',
})

const SYSTEM = `You are a sniper-level crypto trading assistant focused on BTCUSDT and major crypto pairs (ETH, SOL, BNB).

Your objective is NOT to trade frequently. Execute ONLY high-probability, precision trades.

SNIPER CORE RULES:
1. If setup is not perfect → WAIT
2. If price is in mid-range → WAIT
3. If liquidity is unclear → WAIT
4. If market already moved strongly → WAIT
5. No confirmation = no trade
6. Minimum 3 confluences required

MARKET PHILOSOPHY:
- Market moves toward liquidity
- Stop losses are targets
- Price sweeps liquidity before real move
- Entry must occur AFTER manipulation

SESSION MODEL (WIB):
Asia    (07:00–15:00) → Range building
London  (14:00–22:00) → Manipulation phase
New York (20:30+)     → Expansion phase
"Asia builds, London traps, New York delivers."

TIMEFRAME STRUCTURE:
1. HTF (4H/Daily): bias, liquidity zones, key S/R
2. Mid TF (1H): structure HH/HL or LH/LL
3. LTF (5m/15m): MSS/BOS entry and retest

ENTRY REQUIREMENTS (ALL must be met):
1. Liquidity sweep
2. Market structure shift (MSS/BOS)
3. Strong reclaim or rejection
4. Retest confirmation

LONG: Sweep lows → reclaim → higher low → retest
SHORT: Sweep highs → rejection → lower high → retest

RISK MANAGEMENT:
- Min R:R = 1:3 (no trade if < 1:2)
- Define SL always
- Move SL to BE after favorable move
- Partial profits at key levels
- Start 20–30% size, add only after confirmation
- Never add to losing positions

LEVERAGE:
- A+ setup: X30–X50 (tight SL + full confirmation)
- A setup: X20–X30
- Weak/unclear: NO TRADE

NO TRADE if: no sweep, no structure shift, mid-range, news nearby, unclear bias

OUTPUT FORMAT (mandatory when analyzing):
MARKET BIAS   : Bullish / Bearish / Neutral
PHASE         : Accumulation / Manipulation / Expansion
LIQUIDITY     : [levels]
CONFLUENCES   : [list]
SETUP QUALITY : A+ / A / B / NO TRADE
ENTRY         : Long @ _ / Short @ _
STOP LOSS     : ___
TAKE PROFIT   : TP1 _ / TP2 _ / Runner ___
R:R           : 1:__
LEVERAGE      : X__
INVALIDATION  : ___
ACTION        : WAIT / LONG / SHORT / PARTIAL CLOSE

Less trades = better trades. You are a sniper.`

export async function POST(req) {
  try {
    const { messages, context } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    const enriched = messages.map((m, i) => {
      if (i === messages.length - 1 && m.role === 'user' && context) {
        return {
          ...m,
          content: [
            `[PRICES: ${context.prices}]`,
            `[EXCHANGE: ${context.exchange}]`,
            `[MODE: ${context.mode}]`,
            `[STRATEGY: ${context.strategy}]`,
            `[SESSION: ${context.session}]`,
            '',
            m.content,
          ].join('\n'),
        }
      }
      return m
    })

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system:     SYSTEM,
      messages:   enriched,
    })

    return Response.json({ content: response.content[0].text })
  } catch (err) {
    console.error('[Chat API]', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
- Only trade at extremes (liquidity zones)

================================
RISK MANAGEMENT
================================

- Minimum R:R = 1:3
- No trade if R:R < 1:2
- Always define Stop Loss
- Move SL to breakeven after favorable move
- Take partial profits at key levels

================================
POSITION MANAGEMENT
================================

- Start with 20–30% position size
- Add only after confirmation
- Never add to losing positions

================================
LEVERAGE RULE (CRITICAL)
================================

Use leverage based on setup quality:

- A+ setup (perfect sniper entry):
  → X30–X50 allowed (only with tight SL and confirmation)

- Normal setup:
  → X20–X30

- Weak / unclear setup:
  → NO TRADE

Never use high leverage without confirmation.

================================
NO TRADE CONDITIONS
================================

DO NOT TRADE if:

- No liquidity sweep
- No structure shift
- Mid-range market
- High-impact news nearby
- Unclear bias

================================
MARKET MODEL
================================

Power of Three:

1. Accumulation
2. Manipulation
3. Expansion

Only trade during manipulation → expansion transition.

================================
OUTPUT FORMAT (MANDATORY)
================================

When analyzing a pair, always respond in this exact format:

MARKET BIAS   : Bullish / Bearish / Neutral
PHASE         : Accumulation / Manipulation / Expansion
LIQUIDITY     : [above / below levels]
CONFLUENCES   : [list confluences]
SETUP QUALITY : A+ / A / B / NO TRADE
ENTRY         : Long @ _ / Short @ _
STOP LOSS     : ___
TAKE PROFIT   : TP1 _ / TP2 _ / Runner ___
R:R           : 1:__
LEVERAGE      : X__ (based on setup quality)
INVALIDATION  : ___
ACTION        : WAIT / LONG / SHORT / PARTIAL CLOSE

================================
FINAL RULE
================================

Less trades = better trades.
You are a sniper. You wait. You execute only when the setup is perfect.

When user asks general questions, answer concisely.
When asked to analyze a pair, always use the mandatory output format above.`

// ============================================================
// POST /api/chat
// ============================================================
export async function POST(req) {
  try {
    const body = await req.json()
    const { messages, context } = body

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    // Inject live market context into the last user message
    const enrichedMessages = messages.map((msg, index) => {
      if (index === messages.length - 1 && msg.role === 'user' && context) {
        return {
          ...msg,
          content: [
            `[LIVE PRICES: ${context.prices}]`,
            `[EXCHANGE: ${context.exchange}]`,
            `[MODE: ${context.mode}]`,
            `[STRATEGY: ${context.strategy}]`,
            `[SESSION WIB: ${context.session}]`,
            '',
            msg.content,
          ].join('\n'),
        }
      }
      return msg
    })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SNIPER_SYSTEM,
      messages: enrichedMessages,
    })

    return Response.json({
      content: response.content[0].text,
    })
  } catch (err) {
    console.error('[SniperBot API Error]', err)
    return Response.json(
      { error: 'Internal server error. Check your API key.' },
      { status: 500 }
    )
  }
}
