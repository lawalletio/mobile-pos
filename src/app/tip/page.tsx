'use client'

// React/Next
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Contexts and Hooks
import { useOrder } from '@/context/Order'
import { useLocalStorage } from 'react-use-storage'
import useCurrencyConverter from '@/hooks/useCurrencyConverter'

// Utils
import { formatToPreference } from '@/lib/formatter'
import { ProductQtyData } from '@/types/product'

// Components
import { Flex, Heading, Text, Divider } from '@/components/UI'
import Container from '@/components/Layout/Container'
import Navbar from '@/components/Layout/Navbar'
import {
  TipMessage,
  TipOptionAmount,
  TipOptionButton,
  TipOptionPercent,
  TipSummary
} from './style'

const TIP_OPTIONS = [5, 10, 15]

function TipContent() {
  const router = useRouter()
  const query = useSearchParams()
  const [tipEnabled] = useLocalStorage<boolean>('tipEnabled', false)
  const [lastCheckoutBack] = useLocalStorage('lastCheckoutBack', '')
  const [storedDestination] = useLocalStorage('destination', '')
  const {
    amount,
    products,
    setAmount,
    setOrderEvent,
    setProducts,
    generateOrderEvent,
    publishOrderInBackground
  } = useOrder()
  const [isMounted, setIsMounted] = useState(false)
  const { convertCurrency } = useCurrencyConverter()

  const backParam = query.get('back')
  const back =
    backParam && backParam !== '/tip'
      ? backParam
      : lastCheckoutBack && lastCheckoutBack !== '/tip'
        ? lastCheckoutBack
        : undefined
  const mainPath = storedDestination ? `/${storedDestination}` : '/'
  const formatArs = useCallback(
    (sats: number) =>
      `$${formatToPreference('ARS', convertCurrency(sats, 'SAT', 'ARS'))} ARS`,
    [convertCurrency]
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || amount > 0) {
      return
    }

    router.replace(mainPath)
  }, [amount, isMounted, mainPath, router])

  const continueToPayment = useCallback(
    (percentage: number) => {
      if (amount <= 0) {
        router.replace(mainPath)
        return
      }

      const finalAmount =
        percentage > 0 ? Math.round(amount * (1 + percentage / 100)) : amount
      const tipAmount = finalAmount - amount
      const baseProducts =
        products.length > 0
          ? products
          : [
              {
                id: 0,
                category_id: 0,
                name: 'Caja',
                description: '',
                price: {
                  value: amount,
                  currency: 'SAT'
                },
                qty: 1
              } as ProductQtyData
            ]
      const finalProducts =
        tipAmount > 0
          ? [
              ...baseProducts,
              {
                id: 999999,
                category_id: 0,
                name: 'Propina',
                description: `${percentage}%`,
                price: {
                  value: tipAmount,
                  currency: 'SAT'
                },
                qty: 1
              } as ProductQtyData
            ]
          : baseProducts

      setAmount(finalAmount)
      setProducts(finalProducts)
      const order = generateOrderEvent!(finalAmount, finalProducts)
      publishOrderInBackground!(order)
      setOrderEvent!(order)
      router.push(
        `/payment/${order.id}${back ? `?back=${encodeURIComponent(back)}` : ''}`
      )
    },
    [
      amount,
      back,
      generateOrderEvent,
      mainPath,
      publishOrderInBackground,
      products,
      router,
      setAmount,
      setOrderEvent,
      setProducts
    ]
  )

  if (!isMounted) {
    return null
  }

  if (!tipEnabled) {
    return null
  }

  if (amount <= 0) {
    return null
  }

  return (
    <>
      <Navbar showBackPage={true} onBack={() => router.replace(back ?? '/')}>
        <Heading as="h5">Tip</Heading>
      </Navbar>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={16} flex={1} justify="center">
          <TipMessage>Cuánto dejas de propina?</TipMessage>

          <TipSummary>
            <Text size="small">Total sin tip</Text>
            <Heading>{amount} SAT</Heading>
            <Text size="small">{formatArs(amount)}</Text>
          </TipSummary>

          <Flex direction="column" gap={8}>
            {TIP_OPTIONS.map(percentage => (
              <TipOptionButton
                key={percentage}
                onClick={() => continueToPayment(percentage)}
              >
                <TipOptionPercent>{percentage}%</TipOptionPercent>
                <TipOptionAmount>
                  {Math.round(amount * (1 + percentage / 100))} SAT ·{' '}
                  {formatArs(Math.round(amount * (1 + percentage / 100)))}
                </TipOptionAmount>
              </TipOptionButton>
            ))}
            <TipOptionButton $isSkip onClick={() => continueToPayment(0)}>
              <TipOptionPercent>NO QUIERO DEJAR PROPINA</TipOptionPercent>
              <TipOptionAmount>
                {amount} SAT · {formatArs(amount)}
              </TipOptionAmount>
            </TipOptionButton>
          </Flex>
        </Flex>
        <Divider y={24} />
      </Container>
    </>
  )
}

export default function TipPage() {
  return (
    <Suspense>
      <TipContent />
    </Suspense>
  )
}
