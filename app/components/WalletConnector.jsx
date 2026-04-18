'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { base, arbitrum } from 'wagmi/chains'
import { useState, useEffect, useCallback } from 'react'

const HYPERLIQUID_API = 'https://api.hyperliquid.xyz'

function shortenAddr(addr) {
  return addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : ''
}

function TradePanel({ address }) {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [target,   setTarget]   = useState('hyperliquid')
  const [symbol,   setSymbol]   = useState('BTC')
  const [side,     setSide]     = useState('buy')
  const [size,     setSize]     = useState('')
  const [leverage, setLeverage] = useState('10')
  const [status,   setStatus]   = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleTrade() {
    if (!size || isNaN(size) || Number(size) <= 0) {
      setStatus('⚠ Enter valid size')
      return
    }
    setLoading(true)
    if (target === 'hyperliquid') {
      if (chainId !== arbitrum.id) {
        setStatus('Switching to Arbitrum...')
        switchChain({ chainId: arbitrum.id })
        setLoading(false)
        return
      }
      try {
        setStatus('Checking Hyperliquid account...')
        const res = await fetch(`${HYPERLIQUID_API}/info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'clearinghouseState', user: address }),
        })
        const data = await res.json()
        const val = data?.marginSummary?.accountValue ?? 'N/A'
        setStatus(`✅ HL Ready | Equity: ${val} USDC`)
      } catch (e) {
        setStatus('❌ HL Error: ' + e.message)
      }
    } else {
      if (chainId !== base.id) {
        setStatus('Switching to Base...')
        switchChain({ chainId: base.id })
        setLoading(false)
        return
      }
      setStatus('⚠ Aster: Plug in contract address + ABI')
    }
    setLoading(false)
  }

  const inp = {
    flex: 1,
    padding: '7px 10px',
    borderRadius: 7,
    border: '1px solid #1c1c2a',
    background: '#060610',
    color: '#e2e8f0',
    fontSize: 12,
    fontFamily: "'Space Mono',monospace",
    outline: 'none',
  }

  const sel = {
    ...inp,
    cursor: 'pointer',
  }

  return (
    <div style={{ marginTop: 12, borderTop: '1px solid #1c1c2a', paddingTop: 12 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {['hyperliquid','aster'].map(t => (
          <button key={t} onClick={() => setTarget(t)} style={{
            flex: 1, padding: '6px 4px', borderRadius: 7,
            border: target === t ? '1px solid #00f5a060' : '1px solid #1c1c2a',
            background: target === t ? '#00f5a015' : 'transparent',
            color: target === t ? '#00f5a0' : '#4a5568',
            fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.05em',
          }}>
            {t === 'hyperliquid' ? '⚡ HYPE' : '🌀 ASTER'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <select value={symbol} onChange={e => setSymbol(e.target.value)} style={sel}>
          {['BTC','ETH','SOL','BNB','ARB'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={side} onChange={e => setSide(e.target.value)}
          style={{ ...sel, color: side === 'buy' ? '#00f5a0' : '#ff3b5c' }}>
          <option value="buy">LONG</option>
          <option value="sell">SHORT</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input type="number" placeholder="Size USDC" value={size}
          onChange={e => setSize(e.target.value)} style={inp} />
        <input type="number" placeholder="Lev" value={leverage}
          onChange={e => setLeverage(e.target.value)} style={{ ...inp, width: 60, flex: 'none' }} />
        <span style={{ color: '#4a5568', fontSize: 11, alignSelf: 'center', fontFamily: "'Space Mono',monospace" }}>x</span>
      </div>

      <button onClick={handleTrade} disabled={loading} style={{
        width: '100%', padding: '9px', borderRadius: 8, border: 'none',
        background: side === 'buy'
          ? 'linear-gradient(135deg,#00f5a0,#00c07a)'
          : 'linear-gradient(135deg,#ff3b5c,#c0002a)',
        color: '#000', fontFamily: "'Space Mono',monospace",
        fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1, letterSpacing: '0.08em',
      }}>
        {loading ? 'PROCESSING...' : `${side === 'buy' ? 'LONG' : 'SHORT'} ${symbol} ${leverage}x`}
      </button>

      {status && (
        <div style={{
          marginTop: 8, padding: '6px 10px', borderRadius: 7,
          background: '#0c0c14', border: '1px solid #1c1c2a',
          fontFamily: "'Space Mono',monospace", fontSize: 10,
          color: '#00f5a0', wordBreak: 'break-all',
        }}>
          {status}
        </div>
      )}
    </div>
  )
}

export default function WalletConnector({ onConnect, onDisconnect, compact = false }) {
  const { address, isConnected } = useAccount()
  const [usdcBalance, setUsdcBalance] = useState(null)

  const fetchBalance = useCallback(async (addr) => {
    try {
      const res  = await fetch(`/api/transaction/monitor?address=${addr}`)
      const data = await res.json()
      setUsdcBalance(data.usdcBalance)
    } catch {}
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance(address)
      onConnect?.({ address })
    } else if (!isConnected) {
      setUsdcBalance(null)
      onDisconnect?.()
    }
  }, [isConnected, address])

  return (
    <div style={{
      background: '#0c0c14',
      border: '1px solid #1c1c2a',
      borderRadius: 10,
      padding: compact ? '8px 12px' : '12px 16px',
      position: 'relative',
    }}>
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
          const ready = mounted
          const connected = ready && account && chain
          return (
            <div style={{ opacity: !ready ? 0 : 1 }}>
              {!connected ? (
                <button onClick={openConnectModal} style={{
                  width: '100%', padding: '10px 16px', borderRadius: 10,
                  border: '1px solid #00f5a030',
                  background: 'linear-gradient(135deg,#00f5a015,#0072ff10)',
                  color: '#00f5a0', fontFamily: "'Space Mono',monospace",
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  🔗 Connect Wallet
                </button>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: usdcBalance ? 8 : 0 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#00f5a0', animation: 'pulse 2s infinite',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: '#fff', fontWeight: 700 }}>
                        {shortenAddr(account.address)}
                      </div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#4a5568' }}>
                        {chain.name}
                      </div>
                    </div>
                    <button onClick={openChainModal} style={{
                      fontFamily: "'Space Mono',monospace", fontSize: 9,
                      padding: '3px 8px', borderRadius: 5,
                      border: '1px solid #0072ff30', background: '#0072ff10',
                      color: '#60a5fa', cursor: 'pointer',
                    }}>
                      {chain.name}
                    </button>
                    <button onClick={openAccountModal} style={{
                      fontFamily: "'Space Mono',monospace", fontSize: 9,
                      padding: '3px 8px', borderRadius: 5,
                      border: '1px solid #ff3b5c30', background: '#ff3b5c10',
                      color: '#ff3b5c', cursor: 'pointer',
                    }}>
                      Disconnect
                    </button>
                  </div>

                  {usdcBalance !== null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderTop: '1px solid #1c1c2a' }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: '#4a5568' }}>USDC Balance:</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: '#00f5a0', fontWeight: 700 }}>${usdcBalance}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        }}
      </ConnectButton.Custom>

      {isConnected && <TradePanel address={address} />}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  )
}
