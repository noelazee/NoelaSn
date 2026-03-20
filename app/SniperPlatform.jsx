'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Constants ──────────────────────────────────────────────
const PAIRS = {
  BTC: { symbol: 'BTC/USDT', base: 67420, color: '#f7931a', icon: '₿' },
  ETH: { symbol: 'ETH/USDT', base: 3541,  color: '#627eea', icon: 'Ξ' },
  SOL: { symbol: 'SOL/USDT', base: 182,   color: '#9945ff', icon: '◎' },
  BNB: { symbol: 'BNB/USDT', base: 598,   color: '#f3ba2f', icon: '⬡' },
}

const EXCHANGES = [
  { name: 'Binance', color: '#f3ba2f', status: 'connected'    },
  { name: 'Bybit',   color: '#f7a600', status: 'connected'    },
  { name: 'OKX',     color: '#00b4d8', status: 'disconnected' },
]

const STRATEGIES = ['Sniper', 'Grid Bot', 'Swing', 'Scalping', 'DCA']
const MODES      = ['Auto Agent', 'Semi-Auto', 'Manual']

// ── Helpers ────────────────────────────────────────────────
function getSession() {
  const h = new Date().getHours()
  if (h >= 20) return { name: 'New York', color: '#4d9fff', desc: 'Expansion',    range: '20:30+' }
  if (h >= 14) return { name: 'London',   color: '#f5a623', desc: 'Manipulation', range: '14:00–22:00' }
  if (h >= 7)  return { name: 'Asia',     color: '#9b5de5', desc: 'Accumulation', range: '07:00–15:00' }
  return          { name: 'Off-hours', color: '#4a5568', desc: 'Range',        range: '—' }
}

function fmt(id, price) {
  return `$${price.toFixed(id === 'BTC' ? 0 : 2)}`
}

function now() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// ── Custom hooks ───────────────────────────────────────────
function usePriceFeed() {
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(
      Object.entries(PAIRS).map(([k, v]) => [
        k,
        {
          price:   v.base,
          change:  (Math.random() - 0.5) * 4,
          history: Array.from({ length: 40 }, () =>
            v.base * (1 + (Math.random() - 0.5) * 0.02)
          ),
        },
      ])
    )
  )

  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev }
        Object.keys(PAIRS).forEach(k => {
          const drift    = (Math.random() - 0.488) * PAIRS[k].base * 0.0012
          const newPrice = Math.max(prev[k].price + drift, PAIRS[k].base * 0.5)
          const hist     = [...prev[k].history.slice(1), newPrice]
          const change   = ((newPrice - PAIRS[k].base) / PAIRS[k].base) * 100
          next[k]        = { price: newPrice, change, history: hist }
        })
        return next
      })
    }, 900)
    return () => clearInterval(iv)
  }, [])

  return prices
}

// ── Sub-components ─────────────────────────────────────────
function SparkLine({ history, positive }) {
  const min  = Math.min(...history)
  const max  = Math.max(...history)
  const span = max - min || 1
  const W = 72, H = 24
  const pts = history
    .map((v, i) => `${(i / (history.length - 1)) * W},${H - ((v - min) / span) * H}`)
    .join(' ')
  const stroke = positive ? '#00f5a0' : '#ff3b5c'
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PairCard({ id, data, price, selected, onClick }) {
  const pos = price.change >= 0
  return (
    <div
      onClick={onClick}
      style={{
        background:    selected ? `${data.color}12` : '#0c0c14',
        border:        `1px solid ${selected ? data.color + '50' : '#1c1c2a'}`,
        borderRadius:  10,
        padding:       '10px 12px',
        cursor:        'pointer',
        transition:    'all 0.2s',
        marginBottom:  6,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 15, color: data.color }}>{data.icon}</span>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{id}</span>
        </div>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: pos ? '#00f5a0' : '#ff3b5c' }}>
          {pos ? '+' : ''}{price.change.toFixed(2)}%
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: '#fff' }}>
          {fmt(id, price.price)}
        </span>
        <SparkLine history={price.history} positive={pos} />
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '12px 14px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width:      6,
            height:     6,
            borderRadius: '50%',
            background: '#00f5a0',
            animation:  `bounce 1s ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function ChatMessage({ msg }) {
  const isBot    = msg.role === 'assistant'
  const isSystem = msg.role === 'system'

  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', padding: '6px 0', color: '#4a5568', fontFamily: "'Space Mono',monospace", fontSize: 11 }}>
        — {msg.content} —
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', marginBottom: 14 }}>
      {isBot && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg,#00f5a0,#0072ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, marginRight: 8, flexShrink: 0, marginTop: 2,
        }}>
          🎯
        </div>
      )}
      <div style={{
        maxWidth:   '78%',
        background: isBot ? '#12121e' : '#00f5a015',
        border:     `1px solid ${isBot ? '#1e1e30' : '#00f5a030'}`,
        borderRadius: isBot ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
        padding:    '10px 14px',
      }}>
        <pre style={{
          margin:      0,
          fontFamily:  msg.formatted ? "'Space Mono',monospace" : "'Syne',sans-serif",
          fontSize:    msg.formatted ? 11.5 : 13,
          color:       '#d4dae4',
          lineHeight:  1.65,
          whiteSpace:  'pre-wrap',
          wordBreak:   'break-word',
        }}>
          {msg.content}
        </pre>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#2d3748', marginTop: 6 }}>
          {msg.time}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────
export default function SniperPlatform() {
  const prices = usePriceFeed()

  const [pair,     setPair]     = useState('BTC')
  const [mode,     setMode]     = useState('Semi-Auto')
  const [strategy, setStrategy] = useState('Sniper')
  const [exchange, setExchange] = useState('Binance')
  const [tab,      setTab]      = useState('pairs')
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [history,  setHistory]  = useState([])
  const [messages, setMessages] = useState([
    {
      role:      'assistant',
      content:   'Gue siap. Sniper mode aktif.\n\nKasih tau gue pair yang mau lu analisa, atau minta gue scan setup sekarang.\nGue cuma masuk kalau setup A+ atau A — sisanya gue waiting.',
      time:      now(),
      formatted: false,
    },
  ])

  const chatRef = useRef(null)
  const session = getSession()

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, loading])

  // Send message
  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg    = { role: 'user', content: text, time: now(), formatted: false }
    const newHistory = [...history, { role: 'user', content: text }]

    setMessages(prev => [...prev, userMsg])
    setHistory(newHistory)
    setInput('')
    setLoading(true)

    const priceCtx = Object.entries(prices)
      .map(([k, v]) => `${k}: ${fmt(k, v.price)} (${v.change >= 0 ? '+' : ''}${v.change.toFixed(2)}%)`)
      .join(', ')

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: newHistory,
          context:  {
            prices:   priceCtx,
            exchange,
            mode,
            strategy,
            session: `${session.name} - ${session.desc}`,
          },
        }),
      })

      const data      = await res.json()
      const reply     = data.content || data.error || 'No response.'
      const formatted = reply.includes('MARKET BIAS') || reply.includes('ACTION') || reply.includes('SETUP QUALITY')

      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: now(), formatted }])
      setHistory(prev  => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant', content: 'Connection error. Coba lagi.', time: now(), formatted: false,
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, history, prices, exchange, mode, strategy, session])

  const quickPrompts = [
    `Analisa ${pair} sekarang`,
    'Scan semua pair, ada setup?',
    'Session WIB sekarang apa?',
    `${pair} liquidity zone mana?`,
  ]

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
        .quick-btn:hover  { background:#00f5a015 !important; border-color:#00f5a040 !important; color:#00f5a0 !important; }
        .mode-btn:hover   { opacity:0.85; }
        .send-btn:hover:not(:disabled) { transform:scale(1.05); }
        .exch-btn:hover   { opacity:0.85; }
        textarea:focus    { outline:none; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', flexDirection: 'column', fontFamily: "'Syne',sans-serif", color: '#e2e8f0' }}>

        {/* ════════════ HEADER ════════════ */}
        <header style={{
          borderBottom: '1px solid #1c1c2a', padding: '0 20px', height: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#050508', position: 'sticky', top: 0, zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#00f5a0,#0072ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
              🎯
            </div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px' }}>SniperBot</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, padding: '2px 7px', borderRadius: 4, background: '#00f5a020', color: '#00f5a0', border: '1px solid #00f5a030' }}>
              LIVE
            </span>
          </div>

          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 3, background: '#0c0c14', borderRadius: 8, padding: 3, border: '1px solid #1c1c2a' }}>
            {MODES.map(m => (
              <button key={m} onClick={() => setMode(m)} className="mode-btn" style={{
                fontFamily: "'Space Mono',monospace", fontSize: 10, padding: '4px 11px',
                borderRadius: 5, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: mode === m ? (m === 'Auto Agent' ? '#00f5a0' : m === 'Manual' ? '#4d9fff' : '#f5a623') : 'transparent',
                color:      mode === m ? '#050508' : '#6b7280',
                fontWeight: mode === m ? 700 : 400,
              }}>
                {m}
              </button>
            ))}
          </div>

          {/* Exchange selector */}
          <div style={{ display: 'flex', gap: 6 }}>
            {EXCHANGES.map(ex => (
              <button key={ex.name} onClick={() => setExchange(ex.name)} className="exch-btn" style={{
                fontFamily: "'Space Mono',monospace", fontSize: 10, padding: '4px 10px',
                borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                border:     `1px solid ${exchange === ex.name ? ex.color + '60' : '#1c1c2a'}`,
                background: exchange === ex.name ? ex.color + '15' : 'transparent',
                color:      exchange === ex.name ? ex.color : '#4a5568',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', display: 'inline-block',
                  background: ex.status === 'connected' ? '#00f5a0' : '#ff3b5c',
                  animation:  ex.status === 'connected' ? 'pulse 2s infinite' : 'none',
                }} />
                {ex.name}
              </button>
            ))}
          </div>
        </header>

        {/* ════════════ BODY ════════════ */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 52px)' }}>

          {/* ── LEFT SIDEBAR ── */}
          <aside style={{ width: 200, borderRight: '1px solid #1c1c2a', display: 'flex', flexDirection: 'column', background: '#07070d', flexShrink: 0 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #1c1c2a', padding: '0 8px' }}>
              {['pairs', 'trades'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex: 1, fontFamily: "'Space Mono',monospace", fontSize: 10, padding: '10px 4px',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: 1,
                  color:        tab === t ? '#00f5a0' : '#4a5568',
                  borderBottom: `2px solid ${tab === t ? '#00f5a0' : 'transparent'}`,
                }}>
                  {t === 'pairs' ? 'Pairs' : 'Active'}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
              {tab === 'pairs'
                ? Object.entries(PAIRS).map(([id, data]) => (
                    <PairCard
                      key={id} id={id} data={data}
                      price={prices[id]} selected={pair === id}
                      onClick={() => setPair(id)}
                    />
                  ))
                : (
                  <>
                    {Object.entries(PAIRS).slice(0, 2).map(([id, data]) => {
                      const pnl = ((Math.random() - 0.4) * 8).toFixed(2)
                      const pos = Number(pnl) >= 0
                      return (
                        <div key={id} style={{ background: '#0c0c14', border: `1px solid ${pos ? '#00f5a030' : '#ff3b5c30'}`, borderRadius: 8, padding: '8px 10px', marginBottom: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ color: data.color }}>{data.icon}</span>
                              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12 }}>{id}</span>
                              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, padding: '1px 5px', borderRadius: 3, background: pos ? '#00f5a020' : '#ff3b5c20', color: pos ? '#00f5a0' : '#ff3b5c' }}>
                                {pos ? 'LONG' : 'SHORT'}
                              </span>
                            </div>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: pos ? '#00f5a0' : '#ff3b5c' }}>
                              {pos ? '+' : ''}{pnl}%
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#4a5568', textAlign: 'center', padding: '10px 0' }}>
                      No more positions
                    </div>
                  </>
                )
              }
            </div>

            {/* Strategy picker */}
            <div style={{ padding: '10px 8px', borderTop: '1px solid #1c1c2a' }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#4a5568', letterSpacing: 1, marginBottom: 6 }}>STRATEGY</div>
              {STRATEGIES.map(s => (
                <button key={s} onClick={() => setStrategy(s)} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  fontFamily: "'Space Mono',monospace", fontSize: 11, padding: '5px 8px',
                  borderRadius: 6, border: 'none', cursor: 'pointer', marginBottom: 2, transition: 'all 0.1s',
                  background: strategy === s ? '#00f5a015' : 'transparent',
                  color:      strategy === s ? '#00f5a0'   : '#6b7280',
                }}>
                  {strategy === s ? '▶ ' : '  '}{s}
                </button>
              ))}
            </div>
          </aside>

          {/* ── CHAT MAIN ── */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Pair header */}
            <div style={{ padding: '10px 20px', borderBottom: '1px solid #1c1c2a', display: 'flex', alignItems: 'center', gap: 12, background: '#07070d' }}>
              <span style={{ fontSize: 22, color: PAIRS[pair].color }}>{PAIRS[pair].icon}</span>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15 }}>{PAIRS[pair].symbol}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#4a5568' }}>
                  {exchange} · {strategy} · {mode}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 20, color: '#fff' }}>
                  {fmt(pair, prices[pair].price)}
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: prices[pair].change >= 0 ? '#00f5a0' : '#ff3b5c' }}>
                  {prices[pair].change >= 0 ? '▲' : '▼'} {Math.abs(prices[pair].change).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#00f5a0,#0072ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                    🎯
                  </div>
                  <div style={{ background: '#12121e', border: '1px solid #1e1e30', borderRadius: '4px 12px 12px 12px' }}>
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompts */}
            <div style={{ padding: '0 20px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {quickPrompts.map((q, i) => (
                <button key={i} onClick={() => setInput(q)} className="quick-btn" style={{
                  fontFamily: "'Space Mono',monospace", fontSize: 10, padding: '5px 12px',
                  borderRadius: 20, border: '1px solid #1c1c2a',
                  background: 'transparent', color: '#6b7280', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {q}
                </button>
              ))}
            </div>

            {/* Input box */}
            <div style={{ padding: '10px 20px 16px', borderTop: '1px solid #1c1c2a' }}>
              <div style={{ display: 'flex', gap: 10, background: '#0c0c14', border: '1px solid #1c1c2a', borderRadius: 12, padding: '8px 12px', alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder={`Analisa ${pair}, tanya setup, atau minta scan semua pair...`}
                  rows={1}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#e2e8f0', fontFamily: "'Syne',sans-serif", fontSize: 13, resize: 'none', lineHeight: 1.5, maxHeight: 120, overflow: 'auto' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="send-btn"
                  style={{
                    width: 34, height: 34, borderRadius: 8, border: 'none', flexShrink: 0,
                    cursor:     loading || !input.trim() ? 'not-allowed' : 'pointer',
                    background: loading || !input.trim() ? '#1c1c2a' : 'linear-gradient(135deg,#00f5a0,#0072ff)',
                    color:      loading || !input.trim() ? '#4a5568' : '#050508',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, transition: 'all 0.15s',
                  }}
                >
                  {loading ? '⏳' : '↑'}
                </button>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#2d3748', marginTop: 6, textAlign: 'center' }}>
                Enter to send · Shift+Enter new line · Sniper rules always active
              </div>
            </div>
          </main>

          {/* ── RIGHT PANEL ── */}
          <aside style={{ width: 178, borderLeft: '1px solid #1c1c2a', background: '#07070d', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto', padding: '12px 10px' }}>

            {/* Session */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#4a5568', letterSpacing: 1, marginBottom: 8 }}>SESSION WIB</div>
              <div style={{ background: session.color + '15', border: `1px solid ${session.color}30`, borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: session.color }}>{session.name}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#6b7280', marginTop: 2 }}>{session.desc}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9,  color: '#4a5568', marginTop: 2 }}>{session.range}</div>
              </div>
            </div>

            {/* Risk rules */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#4a5568', letterSpacing: 1, marginBottom: 8 }}>RISK RULES</div>
              {[
                { label: 'Min R:R',  val: '1:3',  ok: true  },
                { label: 'Min Conf', val: '3x',   ok: true  },
                { label: 'Max Lev',  val: 'x50',  ok: true  },
                { label: 'FOMO',     val: 'OFF',  ok: true  },
                { label: 'Avg Down', val: 'OFF',  ok: true  },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1c1c2a' }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#4a5568' }}>{r.label}</span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: r.ok ? '#00f5a0' : '#ff3b5c', fontWeight: 700 }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Live bias */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#4a5568', letterSpacing: 1, marginBottom: 8 }}>BIAS LIVE</div>
              {Object.entries(PAIRS).map(([id, data]) => {
                const ch   = prices[id].change
                const bias = ch > 1 ? 'Bull' : ch < -1 ? 'Bear' : 'Neutral'
                const col  = ch > 1 ? '#00f5a0' : ch < -1 ? '#ff3b5c' : '#f5a623'
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #1c1c2a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: data.color, fontSize: 12 }}>{data.icon}</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#6b7280' }}>{id}</span>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: col, fontWeight: 700 }}>{bias}</span>
                  </div>
                )
              })}
            </div>

            {/* Sniper status */}
            <div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#4a5568', letterSpacing: 1, marginBottom: 8 }}>STATUS</div>
              <div style={{ background: '#0c0c14', border: '1px solid #1c1c2a', borderRadius: 8, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>🎯</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: '#00f5a0' }}>WAITING</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#4a5568', marginTop: 4 }}>Scanning for A+ setup</div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </>
  )
}
