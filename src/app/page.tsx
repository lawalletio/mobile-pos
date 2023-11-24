'use client'

// Components
import { Flex, Heading, Divider, Card, Button } from '@/components/UI'
import Container from '@/components/Layout/Container'
import Input from '@/components/UI/Input'
import { useCallback, useState } from 'react'
import { fetchLNURL, validateEmail } from '@/lib/utils'
import { BtnLoader } from '@/components/Loader/Loader'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [destination, setDestination] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSetDestination = useCallback(async () => {
    setIsLoading(true)

    try {
      await fetchLNURL(destination)
      router.push(`/${destination}`)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [destination, router])

  return (
    <>
      <Container size="small">
        <Flex direction="column" gap={8} flex={1} justify="center">
          <Heading as="h4">Custom POS (v0.0.8)</Heading>
          <Flex gap={8}>
            <Card>
              <Divider y={12} />
              <Flex gap={16} direction="column" flex={1} justify="center">
                <Heading as="h5">Destinatario</Heading>

                <Input
                  value={destination}
                  disabled={isLoading}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="usuario@lawallet.ar"
                />
                <Flex direction="row">
                  <Button
                    disabled={!validateEmail(destination)}
                    variant="bezeledGray"
                    onClick={handleSetDestination}
                  >
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
