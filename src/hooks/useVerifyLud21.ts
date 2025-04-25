import { useEffect, useState } from 'react'

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

  useEffect(() => {
    if (!enabled || !lud21VerifyUrl || settled) return

    let interval = setInterval(async () => {
      console.info('Verifying Lud21...')
      const response = await fetch(lud21VerifyUrl)
      const data = await response.json()
      console.dir(data)
      data.settled && setSettled(true)
    }, delay)

    return () => clearInterval(interval)
  }, [enabled, delay, lud21VerifyUrl, settled])

  return settled
}
