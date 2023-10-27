'use client'

import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PantheonIcon } from '@bitcoin-design/bitcoin-icons-react/filled'

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
import { useOrder } from '@/context/Order'
import { useNostr } from '@/context/Nostr'
import { BtnLoader } from '@/components/Loader/Loader'

export default function Page() {
  const router = useRouter()
  
  const { generateOrderEvent, setAmount, setOrderEvent } = useOrder()
  const { publish } = useNostr()

  const [loading, setLoading] = useState<boolean>(false)
  const { userConfig } = useContext(LaWalletContext)
  const numpadData = useNumpad(userConfig.props.currency)
  const sats = numpadData.intAmount["SAT"]

  const handleClick = async () => {
    if (sats === 0 || loading) return;
    
    setLoading(true)
    const order = generateOrderEvent!()

    console.dir(order)
    // console.info('Publishing order')
    try {
      await publish!(order)
    } catch (e) {
      console.warn('Error publishing order')
      console.warn(e)
    }

    setOrderEvent!(order)
    setLoading(false)

    router.push('/payment/' + order.id)
  }

  useEffect(() => {
    if (numpadData.usedCurrency !== userConfig.props.currency) numpadData.modifyCurrency(userConfig.props.currency)
  }, [userConfig.props.currency])

  useEffect(() => {
    setAmount(sats)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sats])

  return (
    <>
      <Navbar>
        <Icon>
          <PantheonIcon />
        </Icon>
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
          <Button onClick={handleClick} disabled={loading || sats === 0}>{loading ? < BtnLoader /> : "Generar"}</Button>
        </Flex>
        <Divider y={24} />
        <Keyboard numpadData={numpadData} />
        <Divider y={24} />
      </Container>
    </>
  )
}
