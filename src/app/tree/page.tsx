'use client'

import { useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function Page() {
  const router = useRouter()

  const { userConfig } = useContext(LaWalletContext)
  const numpadData = useNumpad(userConfig.props.currency)

  const [cardScanned, setCardScanned] = useState<boolean>(false)

  const handleClick = () => {
    // POC
    router.push('/payment')
  }

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
