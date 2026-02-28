import { useEffect, useRef, useState } from 'react'

interface IUseVerifyLud21 {
  lud21VerifyUrl: string
  enabled: boolean
  delay?: number
}

export const useVerifyLud21 = ({
  lud21VerifyUrl,
  enabled,
  delay = 2000
}: IUseVerifyLud21): boolean => {
  const [settled, setSettled] = useState(false)
  const prevUrlRef = useRef(lud21VerifyUrl)

  // Reset settled state when verify URL changes (new order)
  useEffect(() => {
    if (lud21VerifyUrl !== prevUrlRef.current) {
      setSettled(false)
      prevUrlRef.current = lud21VerifyUrl
    }
  }, [lud21VerifyUrl])

  // Use recursive setTimeout instead of setInterval to prevent
  // concurrent requests when fetch takes longer than the delay
  useEffect(() => {
    if (!enabled || !lud21VerifyUrl || settled) return

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout>

    const check = async () => {
      try {
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller.abort(), delay * 2)

        const response = await fetch(lud21VerifyUrl, {
          signal: controller.signal
        })
        clearTimeout(fetchTimeout)

        const data = await response.json()
        if (data.settled) {
          setSettled(true)
          return
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error verifying LUD21:', error)
        }
      }

      if (!cancelled) {
        timeoutId = setTimeout(check, delay)
      }
    }

    // Start first check
    check()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [enabled, delay, lud21VerifyUrl, settled])

  return settled
}
