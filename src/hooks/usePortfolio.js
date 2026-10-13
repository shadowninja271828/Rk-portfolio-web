import { useCallback, useEffect, useState } from 'react'
import { getPortfolioItems, PORTFOLIO_UPDATED_EVENT } from '../lib/portfolio.js'

export function usePortfolio() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPreview, setIsPreview] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getPortfolioItems()
      setItems(result.data)
      setIsPreview(result.isPreview)
    } catch (err) {
      setError(err.message || 'Unable to load portfolio items.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    function syncLocalPortfolio(event) {
      if (event.type !== 'storage' || event.key === 'rk-editing-portfolio-items') refresh()
    }

    window.addEventListener(PORTFOLIO_UPDATED_EVENT, syncLocalPortfolio)
    window.addEventListener('storage', syncLocalPortfolio)
    return () => {
      window.removeEventListener(PORTFOLIO_UPDATED_EVENT, syncLocalPortfolio)
      window.removeEventListener('storage', syncLocalPortfolio)
    }
  }, [refresh])

  return { items, setItems, loading, error, isPreview, refresh }
}
