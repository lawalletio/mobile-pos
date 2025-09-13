'use client'

// React
import { useCallback, useEffect, useState } from 'react'

// Components
import { Flex, Heading, Divider, Card, Button } from '@/components/UI'
import Container from '@/components/Layout/Container'
import Input from '@/components/UI/Input'
import Top from './layout/top'

// Libs
import { getDefaultDomain } from '@/lib/utils'
import { BtnLoader } from '@/components/Loader/Loader'

// Hooks
import { useRouter } from 'next/navigation'
import { useOrder } from '@/context/Order'
import { useLN } from '@/context/LN'
import { useLocalStorage } from 'react-use-storage'

// Constants
import packageJson from '../../package.json'

export default function Page() {
  const router = useRouter()
  const [destination, setDestination] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { clear: clearOrder } = useOrder()
  const { clear } = useLN()

  const [storedDestination, setStoredDestination] = useLocalStorage(
    'destination',
    ''
  )

  const handleSetDestination = useCallback(async () => {
    let targetLNURL = destination
    if (isLoading) {
      return
    }
    setIsLoading(true)

    if (destination.indexOf('@') === -1) {
      const domain = getDefaultDomain()
      targetLNURL = `${destination}@${domain}`
      setDestination(targetLNURL)
    }

    try {
      // await fetchLNURL(targetLNURL)
      console.log('storing destination: ', targetLNURL)
      setStoredDestination(targetLNURL)
      router.push(`/${targetLNURL}`)
    } catch (e) {
      setIsLoading(false)
      alert((e as Error).message)
    }
  }, [destination, router, isLoading, setStoredDestination])

  // Push to destination on mount
  useEffect(() => {
    if (storedDestination === '') {
      return
    }
    setIsLoading(true)
    console.info('pushing to: ', `/${storedDestination}`)
    setDestination(storedDestination)
    router.push(`/${storedDestination}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedDestination])

  // Clear context on mount
  useEffect(() => {
    clear()
    clearOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Top />
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
          <Heading as="h4">LaWallet POS (v{packageJson.version})</Heading>

          <Card>
            <Divider y={12} />
            <form
              onSubmit={e => {
                e.preventDefault()
                handleSetDestination()
              }}
            >
              <Flex gap={16} direction="column" flex={1} justify="center">
                <Heading as="h5">Lightning Address</Heading>

                <Input
                  value={destination}
                  disabled={isLoading}
                  onChange={e =>
                    setDestination(e.target.value.toLocaleLowerCase().trim())
                  }
                  placeholder="usuario@lawallet.ar"
                />
                <Flex direction="row">
                  <Button variant="bezeledGray" type="submit">
                    {isLoading ? <BtnLoader /> : 'Setup'}
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Card>
        </Flex>
        <Divider y={24} />
      </Container>
    </>
  )
}
