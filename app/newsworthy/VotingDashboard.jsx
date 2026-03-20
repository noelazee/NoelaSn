'use client'

import { useState, useEffect } from 'react'

const API_URL = 'https://newsworthy-api.bflynn4141.workers.dev'

export default function VotingDashboard({ wallet, onEarningsClick }) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [scores, setScores] = useState({})
  const [votes, setVotes] = useState({})
  const [votingInProgress, setVotingInProgress] = useState(false)

  // Fetch pending items
  useEffect(() => {
    fetchPendingItems()
  }, [])

  const fetchPendingItems = async () => {
    try {
      setIsLoading(true)
      setError('')
      const res = await fetch(`${API_URL}/public/pending`)
      
      if (!res.ok) throw new Error('Failed to fetch pending items')
      
      const data = await res.json()
      setItems(data.items || [])
      console.log('[v0] Loaded pending items:', data.items?.length || 0)
    } catch (err) {
      console.error('[v0] Fetch error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Scoring rubric
  const scoringCriteria = [
    {
      name: 'Novelty',
      description: 'New information, or rehash of known events?',
      guidance: 'Opinion/commentary with no new facts: 0-5. Breaking news: 15-20.',
    },
    {
      name: 'Verifiability',
      description: 'On-chain tx, primary source, or hearsay?',
      guidance: 'Tweets with verifiable links: high. Unsubstantiated claims: low.',
    },
    {
      name: 'Impact',
      description: 'Affects protocols, users, or markets materially?',
      guidance: 'Personal opinions with no consequence: 0-5. Major event: 18-20.',
    },
    {
      name: 'Signal:Noise',
      description: 'Real news or engagement farming / rage-bait?',
      guidance: 'Hot takes and commentary are noise. Real events are signal.',
    },
    {
      name: 'Source Quality',
      description: 'Primary source or secondhand?',
      guidance: 'Team announcing their own event: highest. Commentators: lower.',
    },
  ]

  const handleScoreChange = (itemId, criterion, value) => {
    const key = `${itemId}-${criterion}`
    const numValue = Math.min(20, Math.max(0, parseInt(value) || 0))
    setScores((prev) => ({
      ...prev,
      [key]: numValue,
    }))
  }

  const getItemTotal = (itemId) => {
    let total = 0
    scoringCriteria.forEach((crit) => {
      const key = `${itemId}-${crit.name}`
      total += scores[key] || 0
    })
    return total
  }

  const handleVote = async (itemId, voteFor) => {
    try {
      setVotingInProgress(true)
      const total = getItemTotal(itemId)
      const decision = total >= 60 ? 'KEEP' : 'REMOVE'

      console.log(`[v0] Voting ${decision} on item ${itemId} (score: ${total})`)

      // Simulate vote submission
      await new Promise(resolve => setTimeout(resolve, 1500))

      setVotes((prev) => ({
        ...prev,
        [itemId]: decision,
      }))

      // Move to next item after a brief delay
      setTimeout(() => {
        const nextIdx = items.findIndex((i) => i.id === itemId) + 1
        if (nextIdx < items.length) {
          setSelectedItem(items[nextIdx])
        } else {
          setSelectedItem(null)
          alert('All pending items voted! Check your earnings.')
        }
        setVotingInProgress(false)
      }, 1000)
    } catch (err) {
      console.error('[v0] Vote error:', err)
      alert('Failed to vote: ' + err.message)
      setVotingInProgress(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#00b4ff',
          margin: '0 auto 12px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <p style={{ color: '#a0a0b8' }}>Loading pending news items...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(255, 100, 100, 0.1)',
        border: '1px solid rgba(255, 100, 100, 0.3)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        color: '#ff6464',
      }}>
        <p>{error}</p>
        <button
          onClick={fetchPendingItems}
          style={{
            background: '#ff6464',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '12px',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div style={{
        background: 'rgba(0, 180, 255, 0.05)',
        border: '1px solid rgba(0, 180, 255, 0.2)',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✓</div>
        <h2 style={{ fontSize: '20px', margin: '0 0 12px 0' }}>
          No Pending Items
        </h2>
        <p style={{
          color: '#a0a0b8',
          margin: '0 0 20px 0',
        }}>
          All current news items have been voted on. Check back later for new submissions!
        </p>
        <button
          onClick={onEarningsClick}
          style={{
            background: 'linear-gradient(135deg, #00f5a0, #00b4ff)',
            border: 'none',
            color: '#000',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          View Earnings →
        </button>
      </div>
    )
  }

  const item = selectedItem || items[0]
  const total = getItemTotal(item.id)
  const voteDecision = total >= 60

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: 'rgba(0, 245, 160, 0.05)',
          border: '1px solid rgba(0, 245, 160, 0.2)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#00f5a0',
          }}>
            {items.length}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#a0a0b8',
            marginTop: '4px',
          }}>
            Pending Items
          </div>
        </div>
        <div style={{
          background: 'rgba(0, 180, 255, 0.05)',
          border: '1px solid rgba(0, 180, 255, 0.2)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#00b4ff',
          }}>
            {Object.keys(votes).length}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#a0a0b8',
            marginTop: '4px',
          }}>
            Votes Cast
          </div>
        </div>
        <div style={{
          background: 'rgba(100, 200, 255, 0.05)',
          border: '1px solid rgba(100, 200, 255, 0.2)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '18px',
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            color: '#64c8ff',
          }}>
            ~{Object.keys(votes).length * 0.05} USDC
          </div>
          <div style={{
            fontSize: '12px',
            color: '#a0a0b8',
            marginTop: '4px',
          }}>
            Staked
          </div>
        </div>
      </div>

      {/* Item Card */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid #1e1e30',
        borderRadius: '12px',
        padding: '30px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '8px',
              fontFamily: "'Space Mono', monospace",
            }}>
              ITEM #{item.id}
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              margin: '0 0 12px 0',
            }}>
              {item.title || 'Untitled News Item'}
            </h2>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#00b4ff',
                fontSize: '12px',
                textDecoration: 'none',
              }}
            >
              → View Original
            </a>
          </div>
          <div style={{
            textAlign: 'right',
            fontSize: '12px',
            color: '#a0a0b8',
          }}>
            Submitted {new Date(item.submitted_at * 1000).toLocaleDateString()}
          </div>
        </div>

        {/* Scoring */}
        <div style={{
          background: 'rgba(0, 180, 255, 0.05)',
          border: '1px solid rgba(0, 180, 255, 0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 700,
            margin: '0 0 16px 0',
            color: '#00b4ff',
          }}>
            Evaluation Rubric (0-20 per criterion)
          </h3>

          {scoringCriteria.map((crit) => {
            const key = `${item.id}-${crit.name}`
            const value = scores[key] || 0
            return (
              <div key={crit.name} style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}>
                  <div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#fff',
                    }}>
                      {crit.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#a0a0b8',
                      marginTop: '2px',
                    }}>
                      {crit.guidance}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={value}
                    onChange={(e) =>
                      handleScoreChange(item.id, crit.name, e.target.value)
                    }
                    style={{
                      width: '50px',
                      padding: '6px 8px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(0, 180, 255, 0.2)',
                      borderRadius: '4px',
                      color: '#00b4ff',
                      fontSize: '12px',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>
            )
          })}

          <div style={{
            borderTop: '1px solid rgba(0, 180, 255, 0.2)',
            paddingTop: '16px',
            marginTop: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
              }}>
                Total Score
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: voteDecision ? '#00f5a0' : '#ff6464',
                fontFamily: "'Space Mono', monospace",
              }}>
                {total} / 100
              </div>
            </div>
            <div style={{
              fontSize: '12px',
              color: '#a0a0b8',
              marginTop: '8px',
            }}>
              {voteDecision ? (
                <span style={{ color: '#00f5a0' }}>
                  ✓ Recommendation: KEEP (≥60) — This is newsworthy
                </span>
              ) : (
                <span style={{ color: '#ff6464' }}>
                  ✗ Recommendation: REMOVE (&lt;60) — Not clearly newsworthy
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Vote Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={() => handleVote(item.id, true)}
            disabled={votingInProgress || votes[item.id]}
            style={{
              flex: 1,
              background: '#00f5a0',
              color: '#000',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: votingInProgress || votes[item.id] ? 'not-allowed' : 'pointer',
              opacity: votingInProgress || votes[item.id] ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!votingInProgress && !votes[item.id]) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 20px rgba(0, 245, 160, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            {votes[item.id] === 'KEEP' ? '✓ Voted Keep' : 'Keep (Vote Yes)'}
          </button>
          <button
            onClick={() => handleVote(item.id, false)}
            disabled={votingInProgress || votes[item.id]}
            style={{
              flex: 1,
              background: '#ff6464',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: votingInProgress || votes[item.id] ? 'not-allowed' : 'pointer',
              opacity: votingInProgress || votes[item.id] ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!votingInProgress && !votes[item.id]) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 20px rgba(255, 100, 100, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            {votes[item.id] === 'REMOVE' ? '✗ Voted Remove' : 'Remove (Vote No)'}
          </button>
        </div>

        {/* Item List */}
        {items.length > 1 && (
          <div style={{
            marginTop: '30px',
            borderTop: '1px solid #1e1e30',
            paddingTop: '20px',
          }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '12px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              Pending Items ({items.length})
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '8px',
            }}>
              {items.map((i) => (
                <button
                  key={i.id}
                  onClick={() => setSelectedItem(i)}
                  style={{
                    background:
                      selectedItem?.id === i.id
                        ? 'rgba(0, 180, 255, 0.2)'
                        : 'rgba(0, 0, 0, 0.2)',
                    border:
                      selectedItem?.id === i.id
                        ? '1px solid #00b4ff'
                        : '1px solid #1e1e30',
                    color: '#a0a0b8',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  #{i.id} {votes[i.id] && '✓'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
