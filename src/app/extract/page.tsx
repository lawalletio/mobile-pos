'use client'

// Utils
import axios from 'axios'

// Components
import Navbar from '@/components/Layout/Navbar'
import Container from '@/components/Layout/Container'
import { Flex, Heading, Divider, Button, Text } from '@/components/UI'

// Contexts and Hooks
import { useOrder } from '@/context/Order'

export default function Page() {
  // Hooks
  const { paymentsCache } = useOrder()

  const handleExtractOrders = () => {
    const log = Object.entries(paymentsCache!).filter(([key, value]) => {
      return value.isPaid
    })

    const result = log.map(([key, payment]) => {
      return {
        items: payment.items,
        amount: payment.amount,
        isPrinted: payment.isPrinted
      }
    })
    axios.post('https://lacrypta.masize.com/api/extract', result)
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
