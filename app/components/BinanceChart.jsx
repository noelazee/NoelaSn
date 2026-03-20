'use client'

import { useEffect, useRef, useState } from 'react'

const INTERVALS = ['1m', '5m', '15m', '30m', '1h', '4h', '1d']

export default function BinanceChart({ symbol = 'BTCUSDT', interval: init = '15m', height = 220, pairColor = '#00f5a0' }) {
  const containerRef = useRef(null)
  const chartRef     = useRef(null)
  const seriesRef    = useRef(null)
  const wsRef        = useRef(null)
  const [interval, setIntervalVal] = useState(init)
  const [status,   setStatus]      = useState('loading')
  const [price,    setPrice]       = useState(0)
  const [change,   setChange]      = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return
    let destroyed = false

    const initChart = async () => {
      try {
        if (chartRef.current) { try { chartRef.current.remove() } catch {} }
        if (wsRef.current)    { try { wsRef.current.close()    } catch {} }
        setStatus('loading')

        const { createChart } = await import('lightweight-charts')
        if (destroyed || !containerRef.current) return

        const chart = createChart(containerRef.current, {
          layout:          { background: { color: '#07070d' }, textColor: '#4a5568' },
          grid:            { vertLines: { color: '#1c1c2a' }, horzLines: { color: '#1c1c2a' } },
          crosshair:       { mode: 1 },
          rightPriceScale: { borderColor: '#1c1c2a' },
          timeScale:       { borderColor: '#1c1c2a', timeVisible: true, secondsVisible: false },
          width:           containerRef.current.clientWidth,
          height:          height,
        })
        chartRef.current = chart

        const series = chart.addCandlestickSeries({
          upColor:         '#00f5a0',
          downColor:       '#ff3b5c',
          borderUpColor:   '#00f5a0',
          borderDownColor: '#ff3b5c',
          wickUpColor:     '#00f5a060',
          wickDownColor:   '#ff3b5c60',
        })
        seriesRef.current = series

        const res  = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${interval}&limit=100`)
        const data = await res.json()
        if (destroyed) return
        if (!Array.isArray(data)) throw new Error('Invalid data')

        const candles = data.map(k => ({
          time:  Math.floor(k[0] / 1000),
          open:  parseFloat(k[1]),
          high:  parseFloat(k[2]),
          low:   parseFloat(k[3]),
          close: parseFloat(k[4]),
        }))

        series.setData(candles)
        chart.timeScale().fitContent()

        const last = candles[candles.length - 1]
        setPrice(last.close)
        setChange(((last.close - candles[0].open) / candles[0].open) * 100)
        setStatus('live')

        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`)
        wsRef.current = ws

        ws.onmessage = e => {
          if (destroyed) return
          const k = JSON.parse(e.data).k
          series.update({
            time:  Math.floor(k.t / 1000),
            open:  parseFloat(k.o),
            high:  parseFloat(k.h),
            low:   parseFloat(k.l),
            close: parseFloat(k.c),
          })
          setPrice(parseFloat(k.c))
        }
        ws.onclose = () => { if (!destroyed) setTimeout(initChart, 3000) }

        const ro = new ResizeObserver(() => {
          if (containerRef.current && chart) chart.applyOptions({ width: containerRef.current.clientWidth })
        })
        ro.observe(containerRef.current)

      } catch {
        if (!destroyed) setStatus('error')
      }
    }

    initChart()
    return () => {
      destroyed = true
      try { wsRef.current?.close()     } catch {}
      try { chartRef.current?.remove() } catch {}
    }
  }, [symbol, interval, height])

  const pos = change >= 0

  return (
    <div style={{ background: '#07070d', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:4, padding:'7px 10px', borderBottom:'1px solid #1c1c2a' }}>
        {INTERVALS.map(iv => (
          <button key={iv} onClick={() => setIntervalVal(iv)} style={{
            fontFamily:"'Space Mono',monospace", fontSize:10, padding:'3px 7px', borderRadius:5, cursor:'pointer',
            border:     `1px solid ${interval===iv?'#00f5a050':'#1c1c2a'}`,
            background: interval===iv?'#00f5a015':'transparent',
            color:      interval===iv?'#00f5a0':'#4a5568',
          }}>{iv}</button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          {price > 0 && (
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:12, color:'#fff', fontWeight:700 }}>
              ${price.toFixed(price > 100 ? 2 : 4)}
              <span style={{ fontSize:10, color:pos?'#00f5a0':'#ff3b5c', marginLeft:5 }}>
                {pos?'+':''}{change.toFixed(2)}%
              </span>
            </span>
          )}
          {status==='live' && (
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ width:5,height:5,borderRadius:'50%',background:'#00f5a0',display:'inline-block',animation:'pulse 2s infinite' }}/>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#00f5a0' }}>LIVE</span>
            </div>
          )}
          {status==='loading' && <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#4a5568' }}>Loading...</span>}
          {status==='error' && (
            <span onClick={() => setStatus('loading')} style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#ff3b5c', cursor:'pointer' }}>
              ⚠ Retry
            </span>
          )}
        </div>
      </div>
      <div style={{ position:'relative' }}>
        <div ref={containerRef} style={{ width:'100%' }} />
        {status !== 'live' && (
          <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#07070d',height }}>
            <div style={{ fontSize:20, marginBottom:8 }}>{status==='error'?'⚠️':'📡'}</div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:status==='error'?'#ff3b5c':'#4a5568' }}>
              {status==='error'?'Chart unavailable':`Loading ${symbol}...`}
            </div>
            {status==='error' && (
              <button onClick={() => setStatus('loading')} style={{ marginTop:10,fontFamily:"'Space Mono',monospace",fontSize:10,padding:'4px 14px',borderRadius:6,border:'1px solid #ff3b5c30',background:'#ff3b5c10',color:'#ff3b5c',cursor:'pointer' }}>
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
