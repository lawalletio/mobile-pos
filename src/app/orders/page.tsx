'use client'

// React
import { useMemo } from 'react'

// Third-party
import { useLocalStorage } from 'react-use-storage'

// Components
import { Flex, Heading, Text, Divider, Card, Button } from '@/components/UI'
import Container from '@/components/Layout/Container'
import Navbar from '@/components/Layout/Navbar'

// Types
import { IPaymentCache } from '@/types/order'

const statusText = {
  pending: 'Pendiente',
  published: 'Publicada',
  failed: 'Fallida',
  confirmed: 'Confirmado'
}

export default function OrdersPage() {
  const [paymentsCache] = useLocalStorage<IPaymentCache>('paymentsCache', {})

  const orders = useMemo(
    () =>
      Object.values(paymentsCache).sort(
        (a, b) =>
          (b.createdAt ?? b.event.created_at ?? 0) -
          (a.createdAt ?? a.event.created_at ?? 0)
      ),
    [paymentsCache]
  )

  return (
    <>
      <Navbar showBackPage={true}>
        <Heading as="h5">Ordenes</Heading>
      </Navbar>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={16}>
          {orders.length === 0 ? (
            <Text size="small">Todavia no hay ordenes creadas.</Text>
          ) : (
            orders.map(order => {
              const createdAt = order.createdAt ?? order.event.created_at
              const publishedRelays = order.nostrRelayUrls ?? []
              const receiptRelays = order.zapReceiptRelayUrls ?? []

              return (
                <Card key={order.id}>
                  <Flex direction="column" gap={8}>
                    <Flex justify="space-between" align="center" gap={8}>
                      <Flex direction="column" gap={4}>
                        <Text isBold>{order.id.slice(0, 12)}</Text>
                        <Text size="small">
                          {createdAt
                            ? new Date(createdAt * 1000).toLocaleString()
                            : 'Sin fecha'}
                        </Text>
                      </Flex>
                      <Flex flex={0}>
                        <Heading as="h5">{order.amount}</Heading>
                        <Text size="small">SAT</Text>
                      </Flex>
                    </Flex>

                    <Flex direction="column" gap={4}>
                      <Text size="small">
                        Pago: {order.isPaid ? 'Acreditado' : 'Pendiente'}
                      </Text>
                      <Text size="small">
                        Orden:{' '}
                        {statusText[
                          order.nostrPublishStatus ?? 'pending'
                        ] ?? 'Pendiente'}{' '}
                        ({publishedRelays.length} relays)
                      </Text>
                      <Text size="small">
                        Zap receipt:{' '}
                        {statusText[
                          order.zapReceiptStatus ?? 'pending'
                        ] ?? 'Pendiente'}{' '}
                        ({receiptRelays.length} relays)
                      </Text>
                      {order.items.length > 0 && (
                        <Text size="small">
                          Items:{' '}
                          {order.items
                            .map(item => `${item.qty}x ${item.name}`)
                            .join(', ')}
                        </Text>
                      )}
                    </Flex>

                    <Button
                      variant="bezeledGray"
                      onClick={() => navigator.clipboard.writeText(order.id)}
                    >
                      Copiar ID
                    </Button>
                  </Flex>
                </Card>
              )
            })
          )}
        </Flex>
        <Divider y={24} />
      </Container>
    </>
  )
}
