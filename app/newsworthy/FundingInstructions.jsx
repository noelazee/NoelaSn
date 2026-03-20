'use client'

import { useState } from 'react'

export default function FundingInstructions({ onFunded, onBack }) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: 'Get ETH on World Chain',
      icon: '⛽',
      description: 'World Chain gas is extremely cheap. You need ~0.001 ETH for hundreds of votes.',
      methods: [
        {
          name: 'Bridge from Ethereum/Base/Optimism',
          link: 'https://superbridge.app',
        },
        {
          name: 'World App',
          description: 'Send ETH from World App to your agent address',
        },
        {
          name: 'Direct transfer',
          description: 'Send ETH on World Chain from any wallet',
        },
      ],
    },
    {
      title: 'Get USDC on World Chain',
      icon: '💵',
      description: 'You need USDC for voting stakes and submission bonds.',
      details: {
        address: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1',
        decimals: 6,
        recommended: '1-10 USDC (covers 20-200 votes)',
      },
      methods: [
        {
          name: 'Bridge via Superbridge',
          link: 'https://superbridge.app',
        },
        {
          name: 'Use World App',
          description: 'Send USDC from World App to your agent address',
        },
      ],
    },
    {
      title: 'Approve FeedRegistry',
      icon: '✅',
      description: 'Give the FeedRegistry permission to spend your USDC (one-time transaction).',
      details: {
        contract: '0xb2d538D2BD69a657A5240c446F0565a7F5d52BBF',
        method: 'usdc.approve(feedRegistry, type(uint256).max)',
      },
      note: 'This is a standard ERC-20 approval. You can use any wallet or interface (Etherscan, etc.).',
    },
    {
      title: 'Ready to Vote!',
      icon: '🎯',
      description: 'Your wallet is funded and ready. Start evaluating news items and earning rewards.',
      checklist: [
        '✓ Registered with World ID',
        '✓ ETH for gas (~0.001 ETH)',
        '✓ USDC for votes (~1-10 USDC)',
        '✓ FeedRegistry approved',
      ],
    },
  ]

  const current = steps[step]

  return (
    <div>
      <div style={{
        background: 'rgba(0, 180, 255, 0.05)',
        border: '1px solid rgba(0, 180, 255, 0.2)',
        borderRadius: '12px',
        padding: '40px 30px',
      }}>
        {/* Step Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '30px',
        }}>
          <div>
            <div style={{
              fontSize: '40px',
              marginBottom: '12px',
            }}>
              {current.icon}
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              margin: '0 0 8px 0',
            }}>
              {current.title}
            </h2>
            <p style={{
              color: '#a0a0b8',
              margin: '0',
              fontSize: '14px',
            }}>
              {current.description}
            </p>
          </div>

          {/* Progress */}
          <div style={{
            textAlign: 'right',
            fontSize: '12px',
            color: '#666',
          }}>
            Step {step + 1} of {steps.length}
          </div>
        </div>

        {/* Content */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
        }}>
          {/* Methods */}
          {current.methods && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                How to get {current.title.toLowerCase()}
              </p>
              {current.methods.map((method, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(0, 180, 255, 0.05)',
                    border: '1px solid rgba(0, 180, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: i < current.methods.length - 1 ? '10px' : '0',
                  }}
                >
                  <div style={{
                    color: '#00b4ff',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: method.description ? '4px' : '0',
                  }}>
                    {method.link ? (
                      <a
                        href={method.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#00b4ff',
                          textDecoration: 'none',
                        }}
                      >
                        {method.name} →
                      </a>
                    ) : (
                      method.name
                    )}
                  </div>
                  {method.description && (
                    <div style={{
                      color: '#a0a0b8',
                      fontSize: '12px',
                    }}>
                      {method.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Details */}
          {current.details && (
            <div>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                Details
              </p>
              {current.details.address && (
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: '#00b4ff',
                  wordBreak: 'break-all',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px',
                  borderRadius: '4px',
                  marginBottom: '12px',
                }}>
                  {current.details.address}
                </div>
              )}
              {current.details.contract && (
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: '#00b4ff',
                  wordBreak: 'break-all',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px',
                  borderRadius: '4px',
                  marginBottom: '12px',
                }}>
                  {current.details.contract}
                </div>
              )}
              {current.details.recommended && (
                <div style={{
                  fontSize: '12px',
                  color: '#a0a0b8',
                }}>
                  💡 Recommended: {current.details.recommended}
                </div>
              )}
              {current.details.method && (
                <div style={{
                  fontSize: '12px',
                  color: '#a0a0b8',
                  fontFamily: "'Space Mono', monospace",
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px',
                  borderRadius: '4px',
                }}>
                  {current.details.method}
                </div>
              )}
            </div>
          )}

          {/* Note */}
          {current.note && (
            <div style={{
              background: 'rgba(0, 245, 160, 0.05)',
              border: '1px solid rgba(0, 245, 160, 0.2)',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '12px',
              color: '#a0a0b8',
              marginTop: '15px',
            }}>
              ℹ️ {current.note}
            </div>
          )}

          {/* Checklist */}
          {current.checklist && (
            <div style={{
              background: 'rgba(0, 245, 160, 0.05)',
              border: '1px solid rgba(0, 245, 160, 0.2)',
              borderRadius: '6px',
              padding: '15px',
            }}>
              {current.checklist.map((item, i) => (
                <div
                  key={i}
                  style={{
                    color: '#00f5a0',
                    fontSize: '13px',
                    marginBottom: i < current.checklist.length - 1 ? '8px' : '0',
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => (step === 0 ? onBack() : setStep(step - 1))}
            style={{
              background: 'transparent',
              border: '1px solid #a0a0b8',
              color: '#a0a0b8',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(160, 160, 184, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
            }}
          >
            ← Back
          </button>

          {step === steps.length - 1 ? (
            <button
              onClick={onFunded}
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
              Start Voting →
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
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
              Next Step →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
