'use client'

// React/Next
import { useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from 'react-use-storage'

// Hooks
import { useOrder } from '@/context/Order'
import { useNostr } from '@/context/Nostr'
import { LaWalletContext } from '@/context/LaWalletContext'
import useCurrencyConverter from '@/hooks/useCurrencyConverter'

// Types
import { ProductData } from '@/types/product'
import { catalogRelays, loadCatalog, type PosCategory } from '@/lib/catalog'

// Components
import { TrashIcon } from '@bitcoin-design/bitcoin-icons-react/filled'
import {
  Flex,
  Heading,
  Divider,
  Button,
  Product,
  Text,
  Sheet
} from '@/components/UI'
import Container from '@/components/Layout/Container'
import FooterCart from '@/components/Layout/FooterCart'
import Navbar from '@/components/Layout/Navbar'
import { BtnLoader } from '@/components/Loader/Loader'

import jsonCategories from '@/constants/categories.json'

// Style
import theme from '@/styles/theme'
import { aggregateProducts } from '@/lib/utils'

interface MenuProps {
  name?: string
  title?: string
  source?: 'json' | 'nostr'
}

type MenuStatus = 'loading' | 'ready' | 'empty' | 'error'

function groupByCategory(products: ProductData[]) {
  const grouped: { [categoryId: number]: ProductData[] } = {}
  products.forEach(product => {
    const categoryId = product.category_id
    if (!grouped[categoryId]) {
      grouped[categoryId] = []
    }
    grouped[categoryId].push(product)
  })
  return grouped
}

export default function Menu({
  name: pageName = 'coffee',
  title: pageTitle = 'Carrito de Café',
  source = 'json'
}: MenuProps) {
  // Hooks
  const {
    setAmount,
    setOrderEvent,
    generateOrderEvent,
    publishOrderInBackground,
    setProducts,
    clear: clearOrder
  } = useOrder()
  const router = useRouter()
  const { ndk, relays } = useNostr()
  const { destinationLUD06 } = useContext(LaWalletContext)
  const { convertCurrency } = useCurrencyConverter()
  const [tipEnabled] = useLocalStorage<boolean>('tipEnabled', false)
  const [, setLastCheckoutBack] = useLocalStorage('lastCheckoutBack', '')

  const [groupedProducts, setGroupedProducts] = useState<{
    [categoryId: number]: ProductData[]
  }>({})
  const [menuProducts, setMenuProducts] = useState<ProductData[]>([])
  const [menuCategories, setMenuCategories] = useState<PosCategory[]>(
    jsonCategories
  )
  const [status, setStatus] = useState<MenuStatus>(
    source === 'nostr' ? 'loading' : 'ready'
  )
  const [showSheet, setShowSheet] = useState(false)

  // Cart
  const [cart, setCart] = useState<ProductData[]>([])

  const [productQuantities, setProductQuantities] = useState<{
    [productId: number]: number
  }>({})

  const addToCart = useCallback(
    (product: ProductData) => {
      // Update cart
      const updatedCart = [...cart, product]
      setCart(updatedCart)

      // Update quantities
      const productId = product.id
      const updatedQuantities = { ...productQuantities }
      updatedQuantities[productId] = (updatedQuantities[productId] || 0) + 1
      setProductQuantities(updatedQuantities)
    },
    [cart, productQuantities]
  )

  const removeFromCart = useCallback(
    (product: ProductData) => {
      // Update cart
      const updatedCart = [...cart]

      // Update quantities
      const productId = product.id
      const updatedQuantities = { ...productQuantities }
      if (updatedQuantities[productId] > 0) {
        updatedCart.splice(
          updatedCart.findIndex(item => item.id === productId),
          1
        )
        updatedQuantities[productId] -= 1
      }

      setCart(updatedCart)
      setProductQuantities(updatedQuantities)
    },
    [cart, productQuantities]
  )

  const getTotalPrice = useCallback(() => {
    let totalPrice = 0
    cart.forEach(product => {
      totalPrice +=
        product.price.currency === 'SAT'
          ? product.price.value
          : convertCurrency(product.price.value, product.price.currency, 'SAT')
    })
    return totalPrice
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart])

  const loadJsonMenu = useCallback(async (name: string) => {
    const products = (await import(`@/constants/menus/${name}.json`))
      .default as ProductData[]
    setMenuCategories(jsonCategories)
    setGroupedProducts(groupByCategory(products))
    setMenuProducts(products)
    setStatus('ready')
  }, [])

  const loadNostrMenu = useCallback(async () => {
    const pubkey = destinationLUD06?.nip05Pubkey
    if (!destinationLUD06) return
    if (!pubkey) {
      router.replace('/')
      return
    }

    setStatus('loading')
    try {
      const menu = await loadCatalog(
        ndk,
        pubkey,
        catalogRelays(relays ?? [], destinationLUD06.nip05Relays ?? [])
      )
      if (menu.products.length === 0) {
        setGroupedProducts({})
        setMenuProducts([])
        setMenuCategories([])
        setStatus('empty')
        return
      }

      setMenuCategories(menu.categories)
      setGroupedProducts(groupByCategory(menu.products))
      setMenuProducts(menu.products)
      setStatus('ready')
    } catch (e) {
      console.error(e)
      setStatus('error')
    }
  }, [destinationLUD06, ndk, relays, router])

  const handleClearCart = useCallback(() => {
    setCart([])
    setProductQuantities({})
    clearOrder()
  }, [clearOrder])

  const handleClearCartAndCloseSheet = useCallback(() => {
    setShowSheet(false)
    handleClearCart()
  }, [handleClearCart])

  const handleCheckout = async () => {
    const totalAmount = getTotalPrice()
    if (totalAmount <= 0) return

    const back = `/cart/${pageName}`
    setLastCheckoutBack(back)
    setAmount(totalAmount)

    if (tipEnabled) {
      router.push(`/tip?back=${encodeURIComponent(back)}`)
      return
    }

    const order = generateOrderEvent!(totalAmount)
    publishOrderInBackground!(order)
    setOrderEvent!(order)
    router.push(`/payment/${order.id}?back=${encodeURIComponent(back)}`)
  }

  useEffect(() => {
    clearOrder()
    if (source === 'nostr') {
      loadNostrMenu()
      return
    }
    loadJsonMenu(pageName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName, source, destinationLUD06?.nip05Pubkey])

  useEffect(() => {
    setAmount(getTotalPrice())
    setProducts(aggregateProducts(cart))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productQuantities, getTotalPrice])

  return (
    <>
      <Navbar showBackPage={true}>
        <Heading as="h5">{pageTitle}</Heading>
      </Navbar>
      <Container size="small">
        <Divider y={24} />
        {status === 'loading' && (
          <Flex justify="center">
            <BtnLoader />
          </Flex>
        )}
        {status === 'empty' && (
          <Flex justify="center">
            <Text>Este comercio no tiene menú publicado.</Text>
          </Flex>
        )}
        {status === 'error' && (
          <Flex direction="column" gap={16} align="center">
            <Text>No se pudo cargar el menú desde Nostr.</Text>
            <Button variant="bezeled" onClick={() => loadNostrMenu()}>
              Reintentar
            </Button>
          </Flex>
        )}
        {status === 'ready' && (
          <Flex direction="column" gap={24}>
            {menuCategories.map(
              category =>
                groupedProducts[category.id] && (
                  <Flex key={category.id} direction="column">
                    <Text size="small" color={theme.colors.gray50}>
                      {category.name}
                    </Text>
                    <Flex direction="column">
                      {groupedProducts[category.id]?.map(product => (
                        <Product
                          key={product.id}
                          data={product}
                          onAddToCart={() => addToCart(product)}
                          quantityInCart={productQuantities[product.id] || 0}
                          onRemoveOne={() => removeFromCart(product)}
                          onAddOne={() => addToCart(product)}
                        />
                      ))}
                    </Flex>
                  </Flex>
                )
            )}
          </Flex>
        )}
        <Divider y={64} />
        {cart.length > 0 && (
          <FooterCart>
            <Flex gap={8}>
              <div className="clear-button">
                <Button
                  variant="bezeled"
                  color="error"
                  onClick={handleClearCart}
                >
                  <TrashIcon />
                  <span>{cart.length}</span>
                </Button>
              </div>
              <Flex>
                <Button
                  variant="bezeled"
                  onClick={() => setShowSheet(true)}
                >
                  Ver carrito
                </Button>
              </Flex>
            </Flex>
          </FooterCart>
        )}
      </Container>
      <Sheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        title={`Resumen de compra`}
      >
        <Container>
          <ul>
            {Object.entries(productQuantities).map(product => {
              const id = Number(product[0])
              const quantities = Number(product[1])

              const localProduct = menuProducts.find(
                product => product.id === id
              )

              if (quantities > 0 && localProduct) {
                return (
                  <li key={localProduct.id}>
                    <Divider y={8} />
                    <Flex justify="space-between" align="center">
                      <Flex direction="column">
                        <Text isBold>{localProduct?.name}</Text>
                        <Text size="small">
                          {quantities}{' '}
                          {quantities === 1 ? 'unidad' : 'unidades'}.
                        </Text>
                      </Flex>
                      <Flex align="start" gap={4} flex={1}>
                        <Flex flex={0}>
                          <Text size="small">$</Text>
                          <Heading as="h5">
                            {localProduct?.price.value * quantities}
                          </Heading>
                        </Flex>
                      </Flex>
                    </Flex>
                    <Divider y={8} />
                  </li>
                )
              }

              return null
            })}
          </ul>
        </Container>
        <FooterCart>
          <Flex gap={8}>
            <div className="clear-button">
              <Button
                variant="bezeled"
                color="error"
                onClick={handleClearCartAndCloseSheet}
              >
                <TrashIcon />
                <span>{cart.length}</span>
              </Button>
            </div>
            <Flex>
              <Button
                color="secondary"
                variant="bezeled"
                onClick={() => handleCheckout()}
              >
                Cobrar ${getTotalPrice()}
              </Button>
            </Flex>
          </Flex>
        </FooterCart>
      </Sheet>
    </>
  )
}
