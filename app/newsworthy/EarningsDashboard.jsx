'use client'

import { useState, useEffect } from 'react'

export default function EarningsDashboard({ wallet, onVotingClick }) {
  const [earnings, setEarnings] = useState({
    newsTokens: 850,
    usdc: 12.50,
    votesCount: 45,
    successRate: 0.84,
    pendingWithdrawal: 2.30,
  })

  const [stakedNews, setStakedNews] = useState(500)
  const [apiRewards, setApiRewards] = useState(0.47)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true)
      // Simulate withdrawal
      await new Promise(resolve => setTimeout(resolve, 2000))
      setEarnings((prev) => ({
        ...prev,
        usdc: prev.usdc + prev.pendingWithdrawal,
        pendingWithdrawal: 0,
      }))
      alert(`Withdrawn ${earnings.pendingWithdrawal} USDC to your wallet!`)
    } catch (err) {
      alert('Withdrawal failed: ' + err.message)
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleStake = async () => {
    const amount = prompt('Stake NEWS tokens. Enter amount:')
    if (!amount) return

    try {
      setIsWithdrawing(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      const staked = parseInt(amount)
      setStakedNews(prev => prev + staked)
      setEarnings(prev => ({
        ...prev,
        newsTokens: prev.newsTokens - staked,
      }))
      alert(`Staked ${staked} NEWS! You now earn a share of API revenue.`)
    } finally {
      setIsWithdrawing(false)
    }
  }

  const monthlyAPR = (apiRewards * 12 / stakedNews * 100).toFixed(1)

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
    }}>
      {/* Earnings Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* NEWS Tokens */}
        <div style={{
          background: 'rgba(0, 245, 160, 0.05)',
          border: '1px solid rgba(0, 245, 160, 0.2)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            NEWS Tokens (Earned)
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#00f5a0',
            fontFamily: "'Space Mono', monospace",
            marginBottom: '12px',
          }}>
            {earnings.newsTokens.toLocaleString()}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#a0a0b8',
            marginBottom: '12px',
          }}>
            100 NEWS per resolved item + voting bonus
          </div>
          <button
            onClick={handleStake}
            disabled={isWithdrawing}
            style={{
              width: '100%',
              background: 'rgba(0, 245, 160, 0.1)',
              border: '1px solid rgba(0, 245, 160, 0.3)',
              color: '#00f5a0',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isWithdrawing ? 'not-allowed' : 'pointer',
              opacity: isWithdrawing ? 0.5 : 1,
            }}
          >
            Stake NEWS for Rewards
          </button>
        </div>

        {/* USDC */}
        <div style={{
          background: 'rgba(0, 180, 255, 0.05)',
          border: '1px solid rgba(0, 180, 255, 0.2)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            USDC (Available)
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#00b4ff',
            fontFamily: "'Space Mono', monospace",
            marginBottom: '12px',
          }}>
            ${earnings.usdc.toFixed(2)}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#a0a0b8',
            marginBottom: '12px',
          }}>
            From voting rewards + staking
          </div>
          {earnings.pendingWithdrawal > 0 && (
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              style={{
                width: '100%',
                background: '#00b4ff',
                border: 'none',
                color: '#000',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isWithdrawing ? 'not-allowed' : 'pointer',
                opacity: isWithdrawing ? 0.5 : 1,
              }}
            >
              Withdraw ${earnings.pendingWithdrawal.toFixed(2)}
            </button>
          )}
        </div>

        {/* Voting Stats */}
        <div style={{
          background: 'rgba(100, 200, 255, 0.05)',
          border: '1px solid rgba(100, 200, 255, 0.2)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Voting Performance
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#64c8ff',
            marginBottom: '12px',
          }}>
            {earnings.votesCount}
            <span style={{ fontSize: '14px', color: '#a0a0b8', marginLeft: '8px' }}>
              votes
            </span>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#a0a0b8',
          }}>
            Success rate:{' '}
            <span style={{ color: '#00f5a0', fontWeight: 600 }}>
              {(earnings.successRate * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Staking Section */}
      {stakedNews > 0 && (
        <div style={{
          background: 'rgba(0, 245, 160, 0.05)',
          border: '1px solid rgba(0, 245, 160, 0.2)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            margin: '0 0 20px 0',
            color: '#00f5a0',
          }}>
            Staking Rewards
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
          }}>
            <div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '6px',
              }}>
                NEWS Staked
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#00f5a0',
                fontFamily: "'Space Mono', monospace",
              }}>
                {stakedNews.toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '6px',
              }}>
                This Month's Rewards
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#00f5a0',
                fontFamily: "'Space Mono', monospace",
              }}>
                ${apiRewards.toFixed(2)}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#a0a0b8',
                marginTop: '4px',
              }}>
                from x402 API revenue
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '6px',
              }}>
                Projected APR
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#00f5a0',
                fontFamily: "'Space Mono', monospace",
              }}>
                {monthlyAPR}%
              </div>
              <div style={{
                fontSize: '11px',
                color: '#a0a0b8',
                marginTop: '4px',
              }}>
                from API revenue share
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#a0a0b8',
          }}>
            💡 Tip: The more NEWS you stake, the more API revenue you earn. Curation rewards
            = voting. Staking rewards = passive income from query fees.
          </div>
        </div>
      )}

      {/* Voting History */}
      <div style={{
        background: 'rgba(0, 180, 255, 0.05)',
        border: '1px solid rgba(0, 180, 255, 0.2)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          margin: '0 0 20px 0',
          color: '#00b4ff',
        }}>
          Recent Votes
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {[
            { id: 42, action: 'KEEP', score: 78, title: 'Uniswap v4 Deployed', reward: 100 },
            { id: 41, action: 'REMOVE', score: 35, title: 'Market Commentary', reward: 0 },
            { id: 40, action: 'KEEP', score: 72, title: 'OpenAI Releases GPT-5', reward: 100 },
            { id: 39, action: 'KEEP', score: 65, title: 'Ethereum Shanghai Update', reward: 100 },
            { id: 38, action: 'REMOVE', score: 42, title: 'Bull Run Incoming?', reward: 0 },
          ].map((v) => (
            <div
              key={v.id}
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: '4px',
                }}>
                  #{v.id} · {v.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#a0a0b8',
                }}>
                  Score: {v.score}/100
                </div>
              </div>
              <div style={{
                textAlign: 'right',
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: v.action === 'KEEP' ? '#00f5a0' : '#ff6464',
                  marginBottom: '4px',
                }}>
                  {v.action === 'KEEP' ? '✓ Kept' : '✗ Removed'}
                </div>
                {v.reward > 0 && (
                  <div style={{
                    fontSize: '11px',
                    color: '#00f5a0',
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    +{v.reward} NEWS
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
      }}>
        <button
          onClick={onVotingClick}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #00b4ff, #0072ff)',
            border: 'none',
            color: '#fff',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          ← Back to Voting
        </button>
        <a
          href="https://github.com/bflynn4141/newsworthy-protocol"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            background: 'rgba(0, 180, 255, 0.1)',
            border: '1px solid rgba(0, 180, 255, 0.3)',
            color: '#00b4ff',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(0, 180, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(0, 180, 255, 0.1)'}
        >
          View Docs →
        </a>
      </div>
    </div>
  )
}
