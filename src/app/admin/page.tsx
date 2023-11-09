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
  Icon,
  Sheet,
  QRCode
} from '@/components/UI'
import Container from '@/components/Layout/Container'
import Navbar from '@/components/Layout/Navbar'
import { BtnLoader, Loader } from '@/components/Loader/Loader'

// Contexts and Hooks
import { useCard } from '@/hooks/useCard'
import { useNostr } from '@/context/Nostr'

// Types
import { CardUrlParams, ScanAction } from '@/types/card'
import { InfoResponse, ResetResponse } from '@/types/admin'

// Internal components
import MiniCard from './components/MiniCard'

// Thirdparty
import axios from 'axios'
import { formatter } from '@/lib/formatter'
import theme from '@/styles/theme'
import { parseQueryParams } from '@/lib/utils'

// Mocks
import { getMockInfo, getMockReset } from '@/lib/mocks'

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

  alert(JSON.stringify(response.data))

  if (response.status < 200 && response.status >= 300) {
    // alert(JSON.stringify(response.data))
    throw new Error('Hubo un error: ' + JSON.stringify(response.data))
  }
  return response.data
}

type SheetType = 'tap' | 'qr'

export default function Page() {
  // Hooks
  const { isAvailable, scanURL, stop } = useCard()
  const { getBalance } = useNostr()
  const [isTapping, setIsTapping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [cardInfo, setCardInfo] = useState<InfoResponse>()
  const [balance, setBalance] = useState<number>()
  const [qrData, setQrData] = useState<ResetResponse>()
  const [identity, setIdentity] = useState<string>()
  const [targetData, setTargetData] = useState<CardUrlParams>()

  // Sheet admin
  const [showSheet, setShowSheet] = useState<boolean>(false)
  const [sheetStep, setSheetStep] = useState<SheetType>('tap')

  // Local states
  const [cardTapped, setCardTapped] = useState<boolean>(false)

  /** Functions */

  const handleFormat = async () => {
    setIsLoading(true)
    setShowSheet(true)
    // alert('Ahora viene la parte del admin')
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

      console.info('##### tapInfo #####')
      setCardInfo(tapInfo)
      setIdentity(tapInfo?.info.identity?.name)
      setCardTapped(true)

      setBalance((await getBalance(tapInfo.info.holder?.ok.pubKey!)) || 0)
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
    setQrData(undefined)
    setIdentity(undefined)
    setTargetData(undefined)
    setCardTapped(false)
    setIsTapping(false)
    setIsLoading(false)
    setBalance(0)
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

  const handleCloseSheet = () => {
    setShowSheet(false)
    setSheetStep('tap')
  }

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
              <MiniCard
                isActive={cardInfo?.info.status.initialized!}
                title="Init"
              />
              <MiniCard
                isActive={cardInfo?.info.status.associated!}
                title="Asociada."
              />
              <MiniCard
                isActive={cardInfo?.info.status.activated!}
                title="Activada"
              />
              <MiniCard
                isActive={cardInfo?.info.status.hasDelegation!}
                title="Delegada"
              />
            </Flex>
            <Divider y={16} />
            <Flex gap={4} direction="column">
              <Text size="small" color={theme.colors.gray50}>
                Usuario:
              </Text>
              <Heading as="h3">
                {identity ? `${identity}@lawallet.ar` : `Sin usuario`}
              </Heading>
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
                <Heading as="h3">
                  {formatter(0, 0, 'SAT').format(balance!)}
                </Heading>
              </Flex>
            </Flex>
            <Divider y={16} />
            <Flex gap={4} direction="column">
              <Text size="small" color={theme.colors.gray50}>
                Diseño:
              </Text>
              <Text isBold>
                {cardInfo?.info.ntag424?.ok?.design.name || `Sin diseño`}
              </Text>
            </Flex>
            <Divider y={16} />
            <Flex gap={4} direction="column">
              <Text size="small" color={theme.colors.gray50}>
                NONCE:
              </Text>
              <Text isBold>
                {cardInfo?.info.ntag424?.ok?.otc || `Sin Nonce`}
              </Text>
            </Flex>
          </>
        ) : (
          <Flex direction="column" align="center" justify="center" flex={1}>
            <Flex
              direction="column"
              justify="center"
              align="center"
              gap={8}
              flex={1}
            >
              <Loader />
              <Text size="small" color={theme.colors.gray50} align="center">
                Escaneá una tarjeta para obtener su información y{' '}
                <strong>RECORDÁ preguntar por su username</strong>.
              </Text>
            </Flex>
            {/* POC: removed flex and button */}
            <Flex>
              <Button disabled={isLoading} onClick={() => getTapInfo()}>
                {isLoading ? <BtnLoader /> : 'Simular tapeo'}
              </Button>
            </Flex>
            {/* end POC */}
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
      <Flex flex={1}>
        <Container size="small">
          <Divider y={16} />
          <Flex gap={8} direction="column">
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
                  <>
                    <Flex
                      direction="column"
                      justify="center"
                      align="center"
                      gap={8}
                      flex={1}
                    >
                      <Loader />
                      <Text
                        size="small"
                        color={theme.colors.gray50}
                        align="center"
                      >
                        Escaneá nuevamente la tarjeta en caso de que la
                        información proporcionada sea correcta.
                      </Text>
                    </Flex>
                    {/* POC: removed flex and button */}
                    <Flex>
                      <Button
                        color="secondary"
                        disabled={isLoading}
                        onClick={() => handleGetSecurityTap()}
                      >
                        {isLoading ? (
                          <BtnLoader />
                        ) : (
                          'Simular tapeo de seguridad'
                        )}
                      </Button>
                    </Flex>
                    {/* end POC */}
                  </>
                )}
              </>
            ) : (
              <></>
            )}
          </Flex>
          <Divider y={32} />
        </Container>
      </Flex>
      <Sheet
        title="Cambiame, forro"
        isOpen={showSheet}
        onClose={handleCloseSheet}
      >
        {sheetStep === 'tap' ? (
          <Container size="small">
            <Flex
              direction="column"
              justify="center"
              align="center"
              gap={8}
              flex={1}
            >
              <div>
                <Loader />
              </div>
              <Heading as="h3">Esperando un admin...</Heading>
              <Text size="small" color={theme.colors.gray50} align="center">
                Se necesita de una persona con el rango de administrador para
                confirmar la acción.
              </Text>
              {/* POC: removed flex and button */}
              <Flex justify="center">
                <Button size="small" onClick={() => setSheetStep('qr')}>
                  Generar tapeo
                </Button>
              </Flex>
              {/* end POC */}
            </Flex>
          </Container>
        ) : (
          <>
            <QRCode size={325} value={`alguito`} />
            <Divider y={24} />
            <Container size="small">
              <Flex flex={1}>
                <Button variant="bezeled" onClick={handleCloseSheet}>
                  Cerrar
                </Button>
              </Flex>
            </Container>
          </>
        )}
      </Sheet>
    </>
  )
}
