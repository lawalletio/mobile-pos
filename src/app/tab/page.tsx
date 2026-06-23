'use client'

// React/Next
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

// Third-party
import { useLocalStorage } from 'react-use-storage'

// Contexts and Hooks
import { useOrder } from '@/context/Order'
import { useTabs } from '@/hooks/useTabs'
import useCurrencyConverter from '@/hooks/useCurrencyConverter'

// Utils
import { formatToPreference } from '@/lib/formatter'

// Types
import { ITab } from '@/types/tab'

// Components
import {
  Flex,
  Heading,
  Text,
  Divider,
  Card,
  Button,
  Sheet
} from '@/components/UI'
import Container from '@/components/Layout/Container'
import Navbar from '@/components/Layout/Navbar'

export default function TabPage() {
  const router = useRouter()
  const { tabs, clearTabs } = useTabs()
  const { convertCurrency } = useCurrencyConverter()
  const [tipEnabled] = useLocalStorage<boolean>('tipEnabled', false)
  const {
    setAmount,
    setProducts,
    setOrderEvent,
    generateOrderEvent,
    publishOrderInBackground
  } = useOrder()

  const [showConfirm, setShowConfirm] = useState(false)

  const openTabs = useMemo(
    () => Object.values(tabs).sort((a, b) => b.updatedAt - a.updatedAt),
    [tabs]
  )

  const handleClearAll = () => {
    if (openTabs.length === 0) return
    setShowConfirm(true)
  }

  const confirmClearAll = () => {
    clearTabs()
    setShowConfirm(false)
  }

  const handlePay = (tab: ITab) => {
    if (tab.amount <= 0) return

    setAmount(tab.amount)
    setProducts(tab.items)

    if (tipEnabled) {
      router.push(`/tip?back=/tab&tab=${tab.id}`)
      return
    }

    const order = generateOrderEvent!(tab.amount, tab.items)
    publishOrderInBackground!(order)
    setOrderEvent!(order)
    router.push(`/payment/${order.id}?back=/tab&tab=${tab.id}`)
  }

  return (
    <>
      <Navbar showBackPage={true}>
        <Heading as="h5">Cerrar cuenta</Heading>
      </Navbar>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={16}>
          {openTabs.length === 0 ? (
            <Text size="small">No hay cuentas abiertas.</Text>
          ) : (
            <>
              {openTabs.map(tab => (
                <Card key={tab.id}>
                  <button
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                    onClick={() => handlePay(tab)}
                  >
                    <Flex direction="column" gap={8}>
                      <Flex justify="space-between" align="center" gap={8}>
                        <Heading as="h5">{tab.name}</Heading>
                        <Flex flex={0}>
                          <Heading as="h5">{tab.amount}</Heading>
                          <Text size="small">SAT</Text>
                        </Flex>
                      </Flex>

                      {tab.items.length > 0 && (
                        <Text size="small">
                          {tab.items
                            .map(item => `${item.qty}x ${item.name}`)
                            .join(', ')}
                        </Text>
                      )}

                      <Text size="small">
                        $
                        {formatToPreference(
                          'ARS',
                          convertCurrency(tab.amount, 'SAT', 'ARS')
                        )}{' '}
                        ARS
                      </Text>
                    </Flex>
                  </button>
                </Card>
              ))}

              <Divider y={8} />
              <Flex>
                <Button
                  variant="bezeled"
                  color="error"
                  onClick={handleClearAll}
                >
                  Borrar todo
                </Button>
              </Flex>
            </>
          )}
        </Flex>
        <Divider y={24} />
      </Container>

      <Sheet
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Borrar cuentas"
      >
        <Container>
          <Divider y={8} />
          <Text>
            ¿Seguro que querés borrar todas las cuentas abiertas? Esta acción no
            se puede deshacer.
          </Text>
          <Divider y={16} />
          <Flex gap={8}>
            <Button
              variant="bezeledGray"
              onClick={() => setShowConfirm(false)}
            >
              Cancelar
            </Button>
            <Button variant="bezeled" color="error" onClick={confirmClearAll}>
              Borrar todo
            </Button>
          </Flex>
          <Divider y={16} />
        </Container>
      </Sheet>
    </>
  )
}
