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
  const settledRef = useRef(false)
  const prevUrlRef = useRef(lud21VerifyUrl)

  // Reset settled synchronously when the verify URL changes (new invoice/order)
  if (prevUrlRef.current !== lud21VerifyUrl) {
    prevUrlRef.current = lud21VerifyUrl
    settledRef.current = false
    if (settled) {
      setSettled(false)
    }
  }

  useEffect(() => {
    if (!enabled || !lud21VerifyUrl || settledRef.current) return

    const verify = async () => {
      if (settledRef.current) {
        return
      }

      try {
        const separator = lud21VerifyUrl.includes('?') ? '&' : '?'
        const response = await fetch(
          `${lud21VerifyUrl}${separator}t=${Date.now()}`,
          { cache: 'no-store' }
        )
        const data = await response.json()
        if (data.settled) {
          settledRef.current = true
          setSettled(true)
        }
      } catch (error) {
        console.error('Error verifying LUD21:', error)
      }
    }

    void verify()
    const interval = setInterval(() => {
      void verify()
    }, delay)

    return () => clearInterval(interval)
  }, [enabled, delay, lud21VerifyUrl])

  return settled
}
