'use client'

// React/Next
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Contexts and Hooks
import { LaWalletContext } from '@/context/LaWalletContext'
import { useNumpad } from '@/hooks/useNumpad'
import { useOrder } from '@/context/Order'
import { useNostr } from '@/context/Nostr'
import { useLN } from '@/context/LN'

// Utils
import { formatToPreference } from '@/lib/formatter'

// Components
import { Flex, Heading, Text, Divider, Button, Keyboard } from '@/components/UI'
import Container from '@/components/Layout/Container'
import Navbar from '@/components/Layout/Navbar'
import TokenList from '@/components/TokenList'
import { BtnLoader } from '@/components/Loader/Loader'
import { fetchLNURL } from '@/lib/utils'

// Constants
const DESTINATION_LNURL = process.env.NEXT_PUBLIC_DESTINATION!

export default function Page() {
  // Hooks
  const router = useRouter()
  const { generateOrderEvent, setAmount, setOrderEvent, clear } = useOrder()
  const { publish } = useNostr()
  const { setLUD06 } = useLN()
  const { userConfig } = useContext(LaWalletContext)
  const numpadData = useNumpad(userConfig.props.currency)

  // Local states
  const [loading, setLoading] = useState<boolean>(false)
  const sats = numpadData.intAmount['SAT']

  /** Functions */

  const handleClick = async () => {
    if (sats === 0 || loading) return

    setLoading(true)
    const order = generateOrderEvent!()

    console.dir(order)
    // console.info('Publishing order')
    publish!(order).catch(e => {
      console.warn('Error publishing order')
      console.warn(e)
    })

    setOrderEvent!(order)
    setLoading(false)
    router.push('/payment/' + order.id)
  }

  /** usEffects */

  useEffect(() => {
    setAmount(sats)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sats])

  useEffect(() => {
    console.info('HACIENDO ESTO : ' + DESTINATION_LNURL)
    fetchLNURL(DESTINATION_LNURL).then(setLUD06)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // on mount
  useEffect(() => {
    clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Navbar showBackPage={true}>
        <Heading as="h5">Modo CAJA</Heading>
      </Navbar>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
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
        </Flex>
        <Divider y={24} />
        <Flex gap={8}>
          <Button onClick={handleClick} disabled={loading || sats === 0}>
            {loading ? <BtnLoader /> : 'Generar'}
          </Button>
        </Flex>
        <Divider y={24} />
        <Keyboard numpadData={numpadData} />
        <Divider y={24} />
      </Container>
    </>
  )
}
