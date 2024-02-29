'use client'

// React/Next
import { useRouter } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'

// Contexts and Hooks
import { useLN } from '@/context/LN'
import { LaWalletContext } from '@/context/LaWalletContext'
import { useNostr } from '@/context/Nostr'
import { useOrder } from '@/context/Order'
import { useNumpad } from '@/hooks/useNumpad'

// Utils
import { formatToPreference } from '@/lib/formatter'

// Components
import Navbar from '@/components/Layout/Navbar'
import TokenList from '@/components/TokenList'
import { Keyboard } from '@/components/UI'
import { fetchLNURL } from '@/lib/utils'
import {
  BtnLoader,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Icon,
  Text
} from '@lawallet/ui'
import Satoshi from '@/components/Icons/Satoshi'

export default function Page() {
  // Hooks
  const router = useRouter()
  const { generateOrderEvent, setAmount, setOrderEvent, clear } = useOrder()
  const { publish } = useNostr()
  const { setLUD06 } = useLN()
  const { userConfig, destination } = useContext(LaWalletContext)
  const numpadData = useNumpad(userConfig.props.currency)

  // Local states
  const [loading, setLoading] = useState<boolean>(false)
  const sats = numpadData.intAmount['SAT']

  /** Functions */

  const handleClick = async () => {
    if (sats === 0 || loading) return

    setLoading(true)

    try {
      const order = generateOrderEvent!()

      console.dir(order)
      // console.info('Publishing order')
      await publish!(order)
      setOrderEvent!(order)
      router.push('/payment/' + order.id)
    } catch (e) {
      console.warn('Error publishing order')
      console.warn(e)
      setLoading(false)
    }
  }

  /** usEffects */

  useEffect(() => {
    setAmount(sats)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sats])

  useEffect(() => {
    if (!destination || !destination.lud06) {
      router.push('/')
      console.info('No destination')
      return
    }

    setLUD06(destination.lud06)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination])

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
            {userConfig.props.currency === 'SAT' ? (
              <Icon size="small">
                <Satoshi />
              </Icon>
            ) : (
              <Text>$</Text>
            )}

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
          <Button
            onClick={handleClick}
            disabled={loading || sats === 0}
            loading={loading}
          >
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
