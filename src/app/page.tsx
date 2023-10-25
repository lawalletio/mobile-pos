'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'

import { LaWalletContext } from '@/context/LaWalletContext'
import { formatToPreference } from '@/lib/formatter'

import {
  Flex,
  Heading,
  Text,
  Divider,
  LinkButton,
  Button,
  Keyboard
} from '@/components/UI'
import Container from '@/components/Layout/Container'
import TokenList from '@/components/TokenList'
import { useNumpad } from '@/hooks/useNumpad'

export default function Home() {
  const router = useRouter()

  const { userConfig } = useContext(LaWalletContext)
  const numpadData = useNumpad(userConfig.props.currency)

  const handleClick = () => {
    // POC
    router.push('/payment')
  }

  return (
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
        <Button onClick={handleClick}>Generar</Button>
      </Flex>
      <Divider y={24} />
      <Keyboard numpadData={numpadData} />
      <Divider y={24} />
    </Container>
  )
}
