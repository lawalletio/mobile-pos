'use client'

// React/Next
import { useCallback, useContext, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useOrder } from '@/context/Order'

// Utils

// Components
import Navbar from '@/components/Layout/Navbar'
import Container from '@/components/Layout/Container'
import { Flex, Heading, Divider, Button, Text } from '@/components/UI'
import axios from 'axios'

// Contexts and Hooks

export default function Page() {
  // Hooks
  const { paymentsCache } = useOrder()

  const handleExtractOrders = () => {
    axios.post('https://lacrypta.masize.com/api/extract', paymentsCache)
  }

  return (
    <>
      <Navbar showBackPage={true}>
        <Heading as="h5">Extract</Heading>
      </Navbar>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
          <Text>{JSON.stringify(paymentsCache)}</Text>
        </Flex>
        <Divider y={24} />
        <Container size="small">
          <Flex flex={1}>
            <Button variant="bezeled" onClick={handleExtractOrders}>
              Extraer órdenes
            </Button>
          </Flex>
        </Container>
      </Container>
    </>
  )
}
