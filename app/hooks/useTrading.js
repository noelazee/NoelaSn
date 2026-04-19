import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'

export function useTrading() {
  const { address } = useAccount()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  // Get account status from Hyperliquid
  const getAccountStatus = useCallback(async () => {
    if (!address) {
      setError('Wallet not connected')
      return null
    }

    try {
      setLoading(true)
      const res = await fetch('/api/hyperliquid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getAccountState',
          payload: { address },
        }),
      })

      const data = await res.json()
      setResult(data)
      setError(null)
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [address])

  // Get positions from Hyperliquid
  const getPositions = useCallback(async () => {
    if (!address) {
      setError('Wallet not connected')
      return null
    }

    try {
      setLoading(true)
      const res = await fetch('/api/hyperliquid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getPositions',
          payload: { address },
        }),
      })

      const data = await res.json()
      setResult(data)
      setError(null)
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [address])

  // Execute Aster DEX swap
  const executeSwap = useCallback(async (tokenIn, tokenOut, amount) => {
    try {
      setLoading(true)
      const res = await fetch('/api/aster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'executeSwap',
          payload: {
            tokenIn,
            tokenOut,
            amount,
            recipient: address,
            slippage: 0.5,
          },
        }),
      })

      const data = await res.json()
      setResult(data)
      if (data.success) {
        setError(null)
      } else {
        setError(data.error || 'Swap failed')
      }
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [address])

  // Get swap quote
  const getSwapQuote = useCallback(async (tokenIn, tokenOut, amount) => {
    try {
      setLoading(true)
      const res = await fetch('/api/aster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getSwapQuote',
          payload: {
            tokenIn,
            tokenOut,
            amount,
            slippage: 0.5,
          },
        }),
      })

      const data = await res.json()
      setResult(data)
      if (data.success) {
        setError(null)
      } else {
        setError(data.error || 'Quote failed')
      }
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    result,
    getAccountStatus,
    getPositions,
    executeSwap,
    getSwapQuote,
  }
}
