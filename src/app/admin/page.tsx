'use client'

// React/Next
import { useEffect, useState } from 'react'
import { SatoshiV2Icon } from '@bitcoin-design/bitcoin-icons-react/filled'

// Components
import {
  Flex,
  Heading,
  Text,
  Divider,
  Button,
  Keyboard,
  Card,
  Icon
} from '@/components/UI'
import Container from '@/components/Layout/Container'
import Navbar from '@/components/Layout/Navbar'

// Contexts and Hooks
import { useCard } from '@/hooks/useCard'
import { CardUrlParams, ScanAction } from '@/types/card'
import { InfoResponse } from '@/types/admin'
import { getMockInfo, getMockReset } from '@/lib/mocks'
import { parseQueryParams } from '@/lib/utils'
import { BtnLoader } from '@/components/Loader/Loader'

// Internal components
import MiniCard from './components/MiniCard'

// Thirdparty
import axios from 'axios'
import theme from '@/styles/theme'

const FEDERATION_ID = process.env.NEXT_PUBLIC_FEDERATION_ID!

// Util functions
const requestCardEndpoint = async (url: string, type: ScanAction) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-LaWallet-Action': type,
    'X-LaWallet-Param': `federationId=${FEDERATION_ID}, tokens=BTC`
  }

  switch (type) {
    case ScanAction.INFO:
      return getMockInfo()
      break

    case ScanAction.RESET:
      return getMockReset()
      break

    default:
      throw new Error('Invalid ScanAction')
      break
  }

  // alert('headers: ' + JSON.stringify(headers))
  const response = await axios.get(url, {
    headers: headers
  })
  if (response.status < 200 && response.status >= 300) {
    // alert(JSON.stringify(response.data))
    throw new Error('Hubo un error: ' + JSON.stringify(response.data))
  }
  return response.data
}

export default function Page() {
  // Hooks
  const { isAvailable, scanURL, stop } = useCard()
  const [isTapping, setIsTapping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [cardInfo, setCardInfo] = useState<InfoResponse>()
  const [targetData, setTargetData] = useState<CardUrlParams>()

  // Local states
  const [cardTapped, setCardTapped] = useState<boolean>(false)

  /** Functions */

  const handleFormat = async () => {
    setIsLoading(true)
    alert('Ahora viene la parte del admin')
    setIsLoading(false)
  }

  const handleGetSecurityTap = async () => {
    setIsLoading(true)
    const cardData = await getSecurityTap()
    setTargetData(cardData)
    setIsLoading(false)
  }

  const getTapUrl = async (): Promise<string> => {
    return 'https://mockurl.com/scan?p=ABABABABABA&c=121212121212'
    setIsTapping(true)
    try {
      const url = await scanURL()
      alert(JSON.stringify(url))
      return url
    } catch (e) {
      console.error(e)
      throw new Error('Error tapping the card' + JSON.stringify(e))
    } finally {
      setIsTapping(false)
    }
  }

  const getTapInfo = async () => {
    clear()
    try {
      const tapUrl = await getTapUrl() // Being MOCKED
      const tapInfo = await requestCardEndpoint(tapUrl, ScanAction.INFO) // Being MOCKED

      console.dir(tapInfo)
      setCardInfo(tapInfo)
      setCardTapped(true)
    } catch (e) {
      alert('Error trying to getTapInfo: ' + JSON.stringify(e))
    }
  }

  const getSecurityTap = async (): Promise<CardUrlParams> => {
    setIsTapping(true)
    try {
      const tapUrl = await getTapUrl() // Being MOCKED
      const queryParams = parseQueryParams(tapUrl)
      setIsTapping(false)
      return {
        p: queryParams.p!,
        c: queryParams.c!
      }
    } catch (e) {
      setIsTapping(false)
      throw new Error('Error trying to getSecurityTap: ' + JSON.stringify(e))
    }
  }

  const clear = () => {
    setCardInfo(undefined)
    setCardTapped(false)
    setIsTapping(false)
    setTargetData(undefined)
    setIsLoading(false)
  }

  /** useEffects */

  // NFC available
  useEffect(() => {
    if (isAvailable) {
      getTapInfo()
      return () => {
        stop()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable])

  return (
    <>
      <Navbar showBackPage={true}>
        <Heading as="h5">Modo Admin</Heading>
      </Navbar>
      <Container size="small">
        {cardTapped ? (
          <>
            {/* <Text>{JSON.stringify(cardInfo)}</Text> */}
            <Text size="small" color={theme.colors.gray50}>
              Estados:
            </Text>
            <Divider y={8} />
            <Flex gap={4}>
              <MiniCard isActive={true} title="Fabrica" />
              <MiniCard isActive={true} title="Init." />
              <MiniCard isActive={false} title="Asociada" />
              <MiniCard isActive={false} title="Activada" />
            </Flex>
            <Divider y={16} />
            <Flex gap={4} direction="column">
              <Text size="small" color={theme.colors.gray50}>
                Usuario:
              </Text>
              <Heading as="h3">juanitalapistolera</Heading>
            </Flex>
            <Divider y={16} />
            <Flex gap={4} direction="column">
              <Text size="small" color={theme.colors.gray50}>
                Balance:
              </Text>
              <Flex align="center">
                <Icon size="small">
                  <SatoshiV2Icon />
                </Icon>
                <Heading as="h3">500</Heading>
              </Flex>
            </Flex>
            <Divider y={16} />
            <Flex gap={4} direction="column">
              <Text size="small" color={theme.colors.gray50}>
                Diseño:
              </Text>
              <Text isBold>LaBitconf</Text>
            </Flex>
            <Divider y={16} />
            <Flex gap={4} direction="column">
              <Text size="small" color={theme.colors.gray50}>
                Delegacion:
              </Text>
              <Text isBold>LaCrypta</Text>
            </Flex>
            <Divider y={16} />
          </>
        ) : (
          <Flex direction="column" align="center" justify="center" flex={1}>
            <Flex>
              <Button disabled={isLoading} onClick={() => getTapInfo()}>
                {isLoading ? <BtnLoader /> : 'Simular tapeo'}
              </Button>
            </Flex>
            {isTapping && (
              <>
                <Heading as="h3">Escaneando receptor...</Heading>
                <Text align="center">Acerca la tarjeta para analizar.</Text>
              </>
            )}
          </Flex>
        )}
        <Divider y={24} />
      </Container>
      <Flex>
        <Container size="small">
          <Divider y={16} />
          <Flex gap={8}>
            {cardTapped ? (
              <>
                {targetData ? (
                  <Button
                    color="error"
                    disabled={isLoading}
                    onClick={() => handleFormat()}
                  >
                    {isLoading ? <BtnLoader /> : 'Formatear tarjeta'}
                  </Button>
                ) : (
                  <Button
                    color="secondary"
                    disabled={isLoading}
                    onClick={() => handleGetSecurityTap()}
                  >
                    {isLoading ? <BtnLoader /> : 'Simular tapeo de seguridad'}
                  </Button>
                )}
              </>
            ) : (
              <></>
            )}
          </Flex>
          <Divider y={32} />
        </Container>
      </Flex>
    </>
  )
}
