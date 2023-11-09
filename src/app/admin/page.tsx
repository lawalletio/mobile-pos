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
// import { getMockInfo, getMockReset } from '@/lib/mocks'
import { useRouter } from 'next/navigation'

const FEDERATION_ID = process.env.NEXT_PUBLIC_FEDERATION_ID!

// Util functions
const requestCardEndpoint = async (url: string, type: ScanAction) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-LaWallet-Action': type,
    'X-LaWallet-Param': `federationId=${FEDERATION_ID}, tokens=BTC`
  }

  // switch (type) {
  //   case ScanAction.INFO:
  //     return getMockInfo()
  //     break

  //   case ScanAction.RESET:
  //     return getMockReset()
  //     break

  //   default:
  //     throw new Error('Invalid ScanAction')
  //     break
  // }

  // alert('headers: ' + JSON.stringify(headers))
  const response = await axios.get(url, {
    headers: headers
  })

  // alert(JSON.stringify(response.data))

  if (response.status < 200 && response.status >= 300) {
    // alert(JSON.stringify(response.data))
    throw new Error('Hubo un error: ' + JSON.stringify(response.data))
  }
  return response.data
}

const requestCardFormat = async (
  url: string,
  target: CardUrlParams,
  admin: CardUrlParams
): Promise<ResetResponse> => {
  const response = await axios.post(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      target_p: target.p,
      target_c: target.c,
      admin_p: admin.p,
      admin_c: admin.c
    }
  })

  // alert(JSON.stringify(response.data))

  return response.data

  // return getMockReset()
}

export default function Page() {
  // Hooks
  const { isAvailable, scanURL, stop } = useCard()
  const { getBalance } = useNostr()
  const router = useRouter()
  const [isTapping, setIsTapping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [cardInfo, setCardInfo] = useState<InfoResponse>()
  const [balance, setBalance] = useState<number>()
  const [qrData, setQrData] = useState<ResetResponse>()
  const [identity, setIdentity] = useState<string>()
  const [targetData, setTargetData] = useState<CardUrlParams>()

  // Sheet admin
  const [showSheet, setShowSheet] = useState<boolean>(false)

  // Local states
  const [cardTapped, setCardTapped] = useState<boolean>(false)

  /** Functions */

  const handleFormat = async () => {
    setQrData(undefined)
    setIsLoading(true)
    setShowSheet(true)
    const qrData = await getAdminTap()
    alert(JSON.stringify(qrData))
    setQrData(qrData)
    setIsLoading(false)
  }

  const handleGetSecurityTap = async () => {
    setIsLoading(true)
    const cardData = await getSecurityTap()
    setTargetData(cardData)
    setIsLoading(false)
  }

  const handleCloseSheet = () => {
    router.push('/')
  }

  const getTapUrl = async (): Promise<string> => {
    setIsTapping(true)
    try {
      const url = await scanURL()
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
    alert('Getting security tap')
    setIsTapping(true)
    try {
      const targetUrl = await scanURL()
      const queryParams = parseQueryParams(targetUrl)
      setIsTapping(false)
      return {
        p: queryParams.p!,
        c: queryParams.c!
      }
    } catch (e) {
      setIsTapping(false)
      alert(JSON.stringify(e))
      throw new Error('Error trying to getSecurityTap: ' + JSON.stringify(e))
    }
  }

  const getAdminTap = async (): Promise<ResetResponse> => {
    alert('Getting admin tap')
    const tapUrl = await getTapUrl()
    setIsTapping(false)
    const queryParams = parseQueryParams(tapUrl)

    const adminData = {
      p: queryParams.p!,
      c: queryParams.c!
    }
    const qrData = await requestCardFormat(tapUrl, targetData!, adminData)

    return qrData
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

  // On cardInfo change
  useEffect(() => {
    if (!cardInfo) {
      return
    }
  }, [cardInfo])

  // On targetData change
  useEffect(() => {
    if (!targetData) {
      return
    }

    // handleFormat()
    // alert('DEBERÍA requerir el format')
  }, [targetData])

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
              {isAvailable && (
                <Text size="small" color={theme.colors.gray50} align="center">
                  Escaneá una tarjeta para obtener su información y{' '}
                  <strong>RECORDÁ preguntar por su username</strong>.
                </Text>
              )}
            </Flex>
            {/* POC: removed flex and button */}
            {/* <Flex>
              <Button disabled={isLoading} onClick={() => getTapInfo()}>
                {isLoading ? <BtnLoader /> : 'Simular tapeo'}
              </Button>
            </Flex> */}
            {/* end POC */}
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
                    {isTapping && (
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
                    )}
                    {/* POC: removed flex and button */}
                    {/* <Flex>
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
                    </Flex> */}
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
        title="Escanea el usuario"
        isOpen={showSheet}
        onClose={handleCloseSheet}
      >
        {!qrData ? (
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
