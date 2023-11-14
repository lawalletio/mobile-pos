'use client'

// Utils
import axios from 'axios'

// Components
import Navbar from '@/components/Layout/Navbar'
import Container from '@/components/Layout/Container'
import { Flex, Heading, Divider, Button, Text } from '@/components/UI'

// Contexts and Hooks
import { useOrder } from '@/context/Order'
import { usePrint } from '@/hooks/usePrint'
import useCurrencyConverter from '@/hooks/useCurrencyConverter'

export default function Page() {
  // Hooks
  const { paymentsCache } = useOrder()
  const { print } = usePrint()
  const { convertCurrency } = useCurrencyConverter()

  const handleExtractOrders = () => {
    const log = Object.entries(paymentsCache!).filter(([key, value]) => {
      return value.isPaid
    })
    const orders = log.map(([_key, payment]) => {
      return {
        items: payment.items,
        timestamp: payment.event.created_at,
        amount: payment.amount,
        isPrinted: payment.isPrinted,
        lud06: payment.lud06
      }
    })
    printExtract(orders)
    axios.post('https://lacrypta.masize.com/api/extract', {
      orders
    })
  }

  const printExtract = (products: { amount: number }[]) => {
    const amount = products.reduce((acc, product) => {
      return acc + product.amount
    }, 0)

    const printOrder = {
      total: convertCurrency(amount, 'SAT', 'ARS'),
      totalSats: amount,
      currency: 'ARS',
      items: products.map(product => ({
        name: 'Caja',
        price: product.amount,
        qty: 1
      }))
    }

    console.dir(printOrder)
    print(printOrder)
  }

  return (
    <>
      <Navbar showBackPage={true}>
        <Heading as="h5">Extract</Heading>
      </Navbar>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={8} flex={1} justify="center">
          <textarea>{JSON.stringify(paymentsCache)}</textarea>
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
