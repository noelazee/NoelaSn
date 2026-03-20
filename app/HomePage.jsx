'use client'

import { useState } from 'react'
import SniperPlatform from './SniperPlatform'
import Newsworthy from './newsworthy/NewsAgent'

export default function HomePage() {
  const [mode, setMode] = useState('home') 
  const [agentState, setAgentState] = useState({
    registered: false,
    funded: false,
    wallet: null,
    humanId: null,
  })

  const handleSniperMode = () => setMode('sniper')
  const handleAgentMode = () => setMode('agent')
  const handleBack = () => setMode('home')

  if (mode === 'sniper') {
    return <SniperPlatform onBack={handleBack} />
  }

  if (mode === 'agent') {
    return (
      <Newsworthy
        onBack={handleBack}
        agentState={agentState}
        setAgentState={setAgentState}
      />
    )
  }

  
  return (
    <div style={{
      background: 'linear-gradient(135deg, #050508 0%, #0a0a12 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: "'Syne', 'Inter', sans-serif",
      padding: '20px',
    }}>
      {/* NOELA Logo */}
      <div style={{
        marginBottom: '40px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <img
            src="/sniper-mascot.jpg"
            alt="NOELA Mascot"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              objectFit: 'cover',
              border: '2px solid #00f5a0',
              boxShadow: '0 0 20px rgba(0, 245, 160, 0.3)',
            }}
          />
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 800,
              margin: '0',
              letterSpacing: '-1px',
            }}>
              NOELA
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#00f5a0',
              margin: '4px 0 0 0',
              fontFamily: "'Space Mono', monospace",
              fontWeight: 600,
            }}>
              PRECISION•EXECUTION•REWARDS✓
            </p>
          </div>
        </div>
        <p style={{
          fontSize: '18px',
          color: '#a0a0b8',
          maxWidth: '600px',
          lineHeight: '1.6',
          margin: '0 auto',
        }}>
          AI-powered sniper trading + verified news curation on World Chain.
          <br />
          <span style={{ color: '#00f5a0' }}>Earn by trading. Earn by curating.</span>
        </p>
      </div>

      {/* Mode Selection */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        maxWidth: '700px',
        width: '100%',
      }}>
        {/* Sniper Trading Card */}
        <div
          onClick={handleSniperMode}
          style={{
            background: 'rgba(0, 245, 160, 0.05)',
            border: '2px solid #00f5a0',
            borderRadius: '12px',
            padding: '30px 20px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 245, 160, 0.1)'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 245, 160, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 245, 160, 0.05)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: '0 0 10px 0',
          }}>
            Sniper Trading
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#a0a0b8',
            margin: '0',
            lineHeight: '1.5',
          }}>
            High Precision crypto trading. BTC ETH SOL BNB. Multi-exchange.
          </p>
        </div>

        {/* Agent Curation Card */}
        <div
          onClick={handleAgentMode}
          style={{
            background: 'rgba(0, 180, 255, 0.05)',
            border: '2px solid #00b4ff',
            borderRadius: '12px',
            padding: '30px 20px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 180, 255, 0.1)'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 180, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 180, 255, 0.05)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📰</div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: '0 0 10px 0',
          }}>
            News Curation
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#a0a0b8',
            margin: '0',
            lineHeight: '1.5',
          }}>
            Evaluate & vote on verified news. Earn NEWS tokens on World Chain.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '60px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center',
      }}>
        <p>
         Powered by NOELA_ZEE
        </p>
      </div>
    </div>
  )
}
