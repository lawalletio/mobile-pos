'use client'

// Components
import {
  BtnLoader,
  Input,
  Container,
  Flex,
  Heading,
  Divider,
  Button,
  Loader
} from '@lawallet/ui'
import { Card } from '@/components/UI'
import { useCallback, useContext, useEffect, useState } from 'react'
import { fetchLNURL, validateEmail } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { LaWalletContext } from '@/context/LaWalletContext'

export default function Page() {
  const router = useRouter()
  const [inputDestination, setInputDestination] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const { destination } = useContext(LaWalletContext)

  const handleSetDestination = useCallback(async () => {
    if (isLoading) {
      return
    }
    setIsLoading(true)

    try {
      await fetchLNURL(inputDestination)
      router.push(`/${inputDestination}`)
    } catch (e) {
      setIsLoading(false)
      alert((e as Error).message)
    }
  }, [inputDestination, router, isLoading])

  useEffect(() => {
    if (destination && destination?.lud06 && destination?.lud16) {
      router.push(`/${destination.lud16}`)
    } else {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination])

  return (
    <>
      <Container size="small">
        {isLoading ? (
          <Loader />
        ) : (
          <Flex direction="column" gap={8} flex={1} justify="center">
            <Heading as="h4">Custom POS (v0.0.8)</Heading>
            <Flex gap={8}>
              <Card>
                <Divider y={12} />
                <Flex gap={16} direction="column" flex={1} justify="center">
                  <Heading as="h5">Destinatario</Heading>

                  <Input
                    value={inputDestination}
                    disabled={isLoading}
                    onChange={e => setInputDestination(e.target.value)}
                    placeholder="usuario@lawallet.ar"
                  />
                  <Flex direction="row">
                    <Button
                      disabled={!validateEmail(inputDestination)}
                      variant="bezeledGray"
                      onClick={handleSetDestination}
                      loading={isLoading}
                    >
                      {'Configurar'}
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            </Flex>
          </Flex>
        )}
      </Container>
    </>
  )
}
