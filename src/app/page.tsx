'use client'

// Components
import { Flex, Heading, Divider, Card, Button } from '@/components/UI'
import Container from '@/components/Layout/Container'
import Input from '@/components/UI/Input'
import { useCallback, useEffect, useState } from 'react'
import { fetchLNURL, getDefaultDomain } from '@/lib/utils'
import { BtnLoader } from '@/components/Loader/Loader'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from 'react-use-storage'

import packageJson from '../../package.json'

export default function Page() {
  const router = useRouter()
  const [destination, setDestination] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

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
      await fetchLNURL(targetLNURL)
      console.log('storing destination: ', targetLNURL)
      setStoredDestination(targetLNURL)
      router.push(`/${targetLNURL}`)
    } catch (e) {
      setIsLoading(false)
      alert((e as Error).message)
    }
  }, [destination, router, isLoading, setStoredDestination])

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

  return (
    <>
      <Container size="small">
        <Flex direction="column" gap={8} flex={1} justify="center">
          <Heading as="h4">Custom POS (v{packageJson.version})</Heading>
          <Flex gap={8}>
            <Card>
              <Divider y={12} />
              <Flex gap={16} direction="column" flex={1} justify="center">
                <Heading as="h5">Destinatario</Heading>

                <Input
                  value={destination}
                  disabled={isLoading}
                  onChange={e =>
                    setDestination(e.target.value.toLocaleLowerCase().trim())
                  }
                  placeholder="usuario@lawallet.ar"
                />
                <Flex direction="row">
                  <Button variant="bezeledGray" onClick={handleSetDestination}>
                    {isLoading ? <BtnLoader /> : 'Configurar'}
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </Flex>
      </Container>
    </>
  )
}
