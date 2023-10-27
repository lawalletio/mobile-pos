'use client'

import { useCallback, useContext, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SharedWalletIcon } from '@bitcoin-design/bitcoin-icons-react/filled'

import { LaWalletContext } from '@/context/LaWalletContext'
import { formatToPreference } from '@/lib/formatter'

import {
  Flex,
  Heading,
  Text,
  Divider,
  Button,
  Keyboard,
  Icon
} from '@/components/UI'
import Container from '@/components/Layout/Container'
import Navbar from '@/components/Layout/Navbar'
import TokenList from '@/components/TokenList'
import { useNumpad } from '@/hooks/useNumpad'
import { extractLNURLFromQR } from '@/lib/utils'
import { useLN } from '@/context/LN'
import { useNostr } from '@/context/Nostr'
import { useOrder } from '@/context/Order'

export default function Page() {
  const router = useRouter()
  const { generateOrderEvent, setAmount, setOrderEvent, clear } = useOrder()
  const { publish } = useNostr()
  const query = useSearchParams()
  const { fetchLNURL } = useLN()

  const { userConfig } = useContext(LaWalletContext)
  const numpadData = useNumpad(userConfig.props.currency)

  const [cardScanned, setCardScanned] = useState<boolean>(false)

  const processUrl = useCallback(
    async (url: string) => {
      const lnurl = extractLNURLFromQR(url)

      if (!lnurl) {
        alert('Invalid QR code')
        return
      }

      try {
        await fetchLNURL(lnurl)
        setCardScanned(true)
      } catch (e) {
        console.error(e)
        alert(JSON.stringify(e))
      }
    },
    [fetchLNURL]
  )

  const sats = numpadData.intAmount['SAT']

  const handleClick = async () => {
    // POC
    const order = generateOrderEvent!()

    console.dir(order)
    // console.info('Publishing order')

    publish!(order).catch(e => {
      console.warn('Error publishing order')
      console.warn(e)
    })
    setOrderEvent!(order)

    router.push('/payment/' + order.id)
  }

  useEffect(() => {
    if (numpadData.usedCurrency !== userConfig.props.currency)
      numpadData.modifyCurrency(userConfig.props.currency)
  }, [numpadData, userConfig.props.currency])

  useEffect(() => {
    setAmount(sats)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sats])

  useEffect(() => {
    const url = query.get('data')

    if (!url) {
      return
    }

    console.info('processUrl?')
    processUrl(url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // on mount
  useEffect(() => {
    clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Navbar theme="secondary">
        <Icon>
          <SharedWalletIcon />
        </Icon>
        <Heading as="h5">Modo ARBOLITO</Heading>
      </Navbar>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
          {cardScanned ? (
            <>
              <Flex justify="center" align="center" gap={4}>
                {userConfig.props.currency !== 'SAT' && <Text>$</Text>}
                <Heading>
                  {formatToPreference(
                    userConfig.props.currency,
                    numpadData.intAmount[numpadData.usedCurrency]
                  )}
                </Heading>
              </Flex>
              <TokenList />
            </>
          ) : (
            <Flex direction="column" align="center">
              <Heading as="h3">Escaneando receptor...</Heading>
              <Text align="center">
                Acerca la tarjeta de quien desea cargar su tarjeta mediante NFC.
              </Text>
              <Divider y={16} />
              <Flex>
                <Button onClick={() => router.push('/scan')}>
                  Escanear QR
                </Button>
              </Flex>
            </Flex>
          )}
        </Flex>
        <Divider y={24} />
        {cardScanned && (
          <>
            <Flex gap={8}>
              <Button
                onClick={handleClick}
                color="secondary"
                disabled={!cardScanned}
              >
                Transferir
              </Button>
            </Flex>
            <Divider y={24} />
            <Keyboard numpadData={numpadData} disabled={!cardScanned} />
            <Divider y={24} />
          </>
        )}
      </Container>
    </>
  )
}
