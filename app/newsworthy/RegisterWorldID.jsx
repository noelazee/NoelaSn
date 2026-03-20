'use client'

import { useState } from 'react'

const WORLD_CHAIN_CONFIG = {
  chainId: 480,
  name: 'World Chain',
  rpcUrl: 'https://worldchain-mainnet.g.alchemy.com/public',
  apiUrl: 'https://newsworthy-api.bflynn4141.workers.dev',
  contracts: {
    agentBook: '0xd4c3680c8cd5Ef45F5AbA9402e32D0561A1401cc',
  },
}

export default function RegisterWorldID({ onComplete, onNext }) {
  const [wallet, setWallet] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [isPolling, setIsPolling] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'creating_session' | 'waiting_verification' | 'submitting' | 'error' | 'success'
  const [error, setError] = useState('')

  // Step 1: Generate random wallet or use connected wallet
  const generateWallet = async () => {
    try {
      setStatus('creating_session')
      setError('')

      // For demo, generate a simple address
      const randomBytes = crypto.getRandomValues(new Uint8Array(20))
      const generatedAddr = '0x' + Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      setWallet(generatedAddr)
      console.log('[v0] Generated wallet:', generatedAddr)

      // Create registration session
      const createSessionRes = await fetch(
        `${WORLD_CHAIN_CONFIG.apiUrl}/register/session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentAddress: generatedAddr,
            nonce: 0,
          }),
        }
      )

      if (!createSessionRes.ok) {
        throw new Error('Failed to create registration session')
      }

      const sessionData = await createSessionRes.json()
      console.log('[v0] Session created:', sessionData.sessionId)
      setSessionId(sessionData.sessionId)

      // Generate QR deep link
      const qrLink = `https://world.org/mini-app?app_id=app_1325590145579e6d6df0809d48040738&path=/mini/register-cli?session=${sessionData.sessionId}`
      setQrCode(qrLink)
      setStatus('waiting_verification')

      // Start polling for completion
      pollSessionStatus(sessionData.sessionId, generatedAddr)
    } catch (err) {
      console.error('[v0] Onboarding error:', err)
      setStatus('error')
      setError(err.message || 'Failed to create session')
    }
  }

  // Step 2: Poll for World ID proof
  const pollSessionStatus = async (sid, addr) => {
    setIsPolling(true)
    let attempts = 0
    const maxAttempts = 200 // ~10 minutes at 3s intervals

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setError('Session expired. Please try again.')
        setStatus('error')
        setIsPolling(false)
        return
      }

      try {
        const res = await fetch(
          `${WORLD_CHAIN_CONFIG.apiUrl}/register/session/${sid}`
        )

        if (res.status === 410) {
          setError('Session expired.')
          setStatus('error')
          setIsPolling(false)
          return
        }

        if (!res.ok) throw new Error('Failed to poll session')

        const data = await res.json()
        console.log('[v0] Session status:', data.status)

        if (data.status === 'completed') {
          console.log('[v0] Proof received, submitting on-chain...')
          setStatus('submitting')
          submitProof(addr, data.proofData)
          setIsPolling(false)
          return
        }

        // Still waiting, poll again in 3 seconds
        attempts++
        setTimeout(poll, 3000)
      } catch (err) {
        console.error('[v0] Poll error:', err)
        setError(err.message)
        setStatus('error')
        setIsPolling(false)
      }
    }

    poll()
  }

  // Step 3: Submit proof on-chain (mock for now)
  const submitProof = async (addr, proofData) => {
    try {
      // In production, this would submit to AgentBook.register() on-chain
      // For demo, we simulate success
      console.log('[v0] Proof verified. Registering agent...')

      // Simulate on-chain submission delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      setStatus('success')
      onComplete({
        address: addr,
        humanId: Math.random().toString(36).slice(2, 10),
      })
    } catch (err) {
      console.error('[v0] Proof submission error:', err)
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <div style={{
      background: 'rgba(0, 180, 255, 0.05)',
      border: '1px solid rgba(0, 180, 255, 0.2)',
      borderRadius: '12px',
      padding: '40px 30px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        margin: '0 auto 20px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #00b4ff, #0072ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
      }}>
        🆔
      </div>

      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        margin: '0 0 12px 0',
      }}>
        Register with World ID
      </h2>

      <p style={{
        color: '#a0a0b8',
        margin: '0 0 30px 0',
        lineHeight: '1.6',
        fontSize: '14px',
      }}>
        Prove you're human. Every voting agent must be linked 1:1 to a verified person via World ID.
        <br />
        <span style={{ fontSize: '12px', color: '#666', marginTop: '8px', display: 'block' }}>
          This requires the World App on your phone.
        </span>
      </p>

      {status === 'idle' && (
        <button
          onClick={generateWallet}
          style={{
            background: 'linear-gradient(135deg, #00b4ff, #0072ff)',
            border: 'none',
            color: '#fff',
            padding: '14px 28px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Start Registration →
        </button>
      )}

      {status === 'creating_session' && (
        <div style={{
          color: '#a0a0b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#00b4ff',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          Creating registration session...
        </div>
      )}

      {status === 'waiting_verification' && (
        <div>
          <div style={{
            background: 'rgba(0, 180, 255, 0.1)',
            border: '1px solid rgba(0, 180, 255, 0.3)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
          }}>
            <p style={{
              color: '#a0a0b8',
              margin: '0 0 15px 0',
              fontSize: '13px',
            }}>
              Scan this QR code with your World App:
            </p>
            <div style={{
              background: '#fff',
              padding: '16px',
              borderRadius: '8px',
              display: 'inline-block',
              marginBottom: '15px',
            }}>
              <div style={{
                fontSize: '12px',
                fontFamily: "'Space Mono', monospace",
                color: '#000',
                wordBreak: 'break-all',
                padding: '8px',
              }}>
                {qrCode ? `[QR Code: ${qrCode.substring(0, 50)}...]` : 'Generating QR...'}
              </div>
            </div>
            <p style={{
              color: '#00b4ff',
              margin: '0',
              fontSize: '12px',
              fontFamily: "'Space Mono', monospace",
            }}>
              Or open this link in World App:
              <br />
              <span style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                {qrCode.substring(0, 80)}...
              </span>
            </p>
          </div>

          <div style={{
            color: '#a0a0b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '13px',
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#00b4ff',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            Waiting for verification... (max 10 min)
          </div>

          <p style={{
            color: '#666',
            fontSize: '12px',
            margin: '15px 0 0 0',
          }}>
            Tip: Make sure you're scanning with the World App, not your regular camera.
          </p>
        </div>
      )}

      {status === 'submitting' && (
        <div style={{
          color: '#a0a0b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#00f5a0',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          Registering agent on World Chain...
        </div>
      )}

      {status === 'success' && (
        <div>
          <div style={{
            color: '#00f5a0',
            fontSize: '32px',
            marginBottom: '15px',
          }}>
            ✓
          </div>
          <p style={{
            color: '#a0a0b8',
            margin: '0 0 20px 0',
          }}>
            Registration complete! Your agent is now active.
          </p>
          <button
            onClick={onNext}
            style={{
              background: 'linear-gradient(135deg, #00f5a0, #00b4ff)',
              border: 'none',
              color: '#000',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Next: Fund Your Wallet →
          </button>
        </div>
      )}

      {status === 'error' && (
        <div>
          <div style={{
            background: 'rgba(255, 100, 100, 0.1)',
            border: '1px solid rgba(255, 100, 100, 0.3)',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            color: '#ff6464',
            fontSize: '13px',
          }}>
            {error || 'An error occurred'}
          </div>
          <button
            onClick={() => {
              setStatus('idle')
              setError('')
            }}
            style={{
              background: '#ff6464',
              border: 'none',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
