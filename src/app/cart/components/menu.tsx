'use client'

// React/Next
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Hooks
import { useLN } from '@/context/LN'
import { useOrder } from '@/context/Order'
import { useNostr } from '@/context/Nostr'
import useCurrencyConverter from '@/hooks/useCurrencyConverter'

// Types
import { ProductData } from '@/types/product'

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

// MOCK
import categories from '@/constants/categories.json'

// Style
import theme from '@/styles/theme'
import { aggregateProducts, fetchLNURL } from '@/lib/utils'
import { LNURLResponse } from '@/types/lnurl'

interface MenuProps {
  name?: string
  title?: string
  lud06: LNURLResponse
}

export default function Menu({
  name: pageName = 'coffee',
  title: pageTitle = 'Carrito de Café',
  lud06
}: MenuProps) {
  // Hooks
  const { setLUD06 } = useLN()
  const {
    amount,
    setAmount,
    setOrderEvent,
    generateOrderEvent,
    setProducts,
    clear: clearOrder
  } = useOrder()
  const { publish } = useNostr()
  const router = useRouter()
  const { convertCurrency } = useCurrencyConverter()

  const [menuProducts, setMenuProducts] = useState<ProductData[]>([])
  const [groupedProducts, setGroupedProducts] = useState<{
    [categoryId: number]: ProductData[]
  }>([])

  // Sheet
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
      totalPrice += product.price.value
    })
    return totalPrice
  }, [cart])

  const loadMenu = useCallback(async (name: string) => {
    const products = (await import(`@/constants/menus/${name}.json`))
      .default as ProductData[]
    const _groupedProducts: {
      [categoryId: number]: ProductData[]
    } = {}
    products.forEach(product => {
      const categoryId = product.category_id
      if (!_groupedProducts[categoryId]) {
        _groupedProducts[categoryId] = []
      }
      _groupedProducts[categoryId].push(product)
    })

    setGroupedProducts(_groupedProducts)
    setMenuProducts(products)
  }, [])

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
    if (amount <= 0) return

    const order = generateOrderEvent!()
    // console.info('Publishing order')
    publish!(order).catch(e => {
      console.warn('Error publishing order')
      console.warn(e)
    })

    setOrderEvent!(order)
    router.push('/payment/' + order.id)
  }

  useEffect(() => {
    clearOrder()
    loadMenu(pageName)
    setLUD06(lud06)
    // fetchLNURL(DESTINATION_LNURL).then(setLUD06)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lud06])

  useEffect(() => {}, [])

  useEffect(() => {
    setAmount(convertCurrency(getTotalPrice(), 'ARS', 'SAT'))
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
        <Flex direction="column" gap={24}>
          {categories.map(category =>
            groupedProducts[category.id] ? (
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
            ) : (
              <></>
            )
          )}
        </Flex>
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
                  // color="secondary"
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
