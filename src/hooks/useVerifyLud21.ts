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

  // Reset settled when the verify URL changes (new invoice/order)
  useEffect(() => {
    if (prevUrlRef.current !== lud21VerifyUrl) {
      prevUrlRef.current = lud21VerifyUrl
      setSettled(false)
    }
  }, [lud21VerifyUrl])

  useEffect(() => {
    if (!enabled || !lud21VerifyUrl || settled) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(lud21VerifyUrl)
        const data = await response.json()
        if (data.settled) {
          setSettled(true)
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Error verifying LUD21:', error)
      }
    }, delay)

    return () => clearInterval(interval)
  }, [enabled, delay, lud21VerifyUrl])

  return settled
}
