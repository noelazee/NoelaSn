'use client'

import { useState, useEffect } from 'react'
import AgentOnboarding from './AgentOnboarding'
import VotingDashboard from './VotingDashboard'
import EarningsDashboard from './EarningsDashboard'

export default function Newsworthy({ onBack, agentState, setAgentState }) {
  const [step, setStep] = useState('onboarding') // 'onboarding' | 'voting' | 'earnings'
  const [isLoading, setIsLoading] = useState(false)

  // Handle agent registration completion
  const handleRegistrationComplete = (walletData) => {
    setAgentState((prev) => ({
      ...prev,
      registered: true,
      wallet: walletData.address,
      humanId: walletData.humanId,
    }))
    setStep('voting')
  }

  // Handle funding completion
  const handleFunded = () => {
    setAgentState((prev) => ({
      ...prev,
      funded: true,
    }))
    setStep('voting')
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #050508 0%, #0a0a12 100%)',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: "'Syne', 'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #1e1e30',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#a0a0b8',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 700,
              margin: '0',
            }}>
              NOELA Newsworthy
            </h1>
            <p style={{
              fontSize: '11px',
              color: '#00b4ff',
              margin: '2px 0 0 0',
              fontFamily: "'Space Mono', monospace",
            }}>
              News Curation Agent
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '12px',
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#666', marginBottom: '4px' }}>Status</div>
            <div style={{
              color: agentState.registered ? '#00f5a0' : '#666',
              fontFamily: "'Space Mono', monospace",
              fontWeight: 600,
            }}>
              {agentState.registered ? '✓ Registered' : 'Not Registered'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#666', marginBottom: '4px' }}>Funded</div>
            <div style={{
              color: agentState.funded ? '#00f5a0' : '#666',
              fontFamily: "'Space Mono', monospace",
              fontWeight: 600,
            }}>
              {agentState.funded ? '✓ Ready' : 'Required'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {!agentState.registered ? (
          <AgentOnboarding
            onRegistrationComplete={handleRegistrationComplete}
            onFunded={handleFunded}
          />
        ) : !agentState.funded ? (
          <div style={{
            background: 'rgba(0, 180, 255, 0.05)',
            border: '1px solid rgba(0, 180, 255, 0.2)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '20px', margin: '0 0 12px 0' }}>
              Fund Your Wallet
            </h2>
            <p style={{
              color: '#a0a0b8',
              margin: '0 0 20px 0',
              lineHeight: '1.6',
            }}>
              You're registered! Now fund your wallet on World Chain to start voting.
            </p>
            <button
              onClick={handleFunded}
              style={{
                background: 'linear-gradient(135deg, #00b4ff, #0072ff)',
                border: 'none',
                color: '#fff',
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
              I've Funded My Wallet →
            </button>
          </div>
        ) : step === 'voting' ? (
          <VotingDashboard
            wallet={agentState.wallet}
            onEarningsClick={() => setStep('earnings')}
          />
        ) : (
          <EarningsDashboard
            wallet={agentState.wallet}
            onVotingClick={() => setStep('voting')}
          />
        )}
      </div>
    </div>
  )
}
