'use client'

// React/Next
import { useState } from 'react'

// Components
import { CartIcon, TrashIcon } from '@bitcoin-design/bitcoin-icons-react/filled'
import { Flex, Heading, Divider, Button, Icon, Product } from '@/components/UI'
import Container from '@/components/Layout/Container'
import FooterCart from '@/components/Layout/FooterCart'
import Navbar from '@/components/Layout/Navbar'

// MOCK
import categories from '@/constants/categories.json'
import products from '@/constants/products.json'

interface ProductData {
  id: number
  category_id: number
  name: string
  description: string
  price: {
    value: number
    currency: string
  }
}

export default function Page() {
  const [cart, setCart] = useState<ProductData[]>([])

  const [productQuantities, setProductQuantities] = useState<{
    [productId: number]: number
  }>({})

  const addToCart = (product: ProductData) => {
    // Update cart
    const updatedCart = [...cart, product]
    setCart(updatedCart)

    // Update quantities
    const productId = product.id
    const updatedQuantities = { ...productQuantities }
    updatedQuantities[productId] = (updatedQuantities[productId] || 0) + 1
    setProductQuantities(updatedQuantities)
  }

  const removeFromCart = (product: ProductData) => {
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
  }

  const getTotalPrice = () => {
    let totalPrice = 0
    cart.forEach(product => {
      totalPrice += product.price.value
    })
    return totalPrice
  }

  const groupedProducts: { [categoryId: number]: ProductData[] } = {}

  products.forEach(product => {
    const categoryId = product.category_id
    if (!groupedProducts[categoryId]) {
      groupedProducts[categoryId] = []
    }
    groupedProducts[categoryId].push(product)
  })

  const clearCart = () => {
    setCart([])
    setProductQuantities({})
  }

  return (
    <>
      <Navbar>
        <Icon>
          <CartIcon />
        </Icon>
        <Heading as="h5">Carrito de compras</Heading>
      </Navbar>
      <Container size="small">
        <Divider y={24} />
        <Flex direction="column" gap={16}>
          {categories.map(category => (
            <Flex key={category.id} direction="column" gap={8}>
              <Heading as="h2">{category.name}</Heading>
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
          ))}
        </Flex>
        <Divider y={64} />
        {cart.length > 0 && (
          <FooterCart>
            <Flex gap={8}>
              <div className="clear-button">
                <Button variant="bezeled" color="error" onClick={clearCart}>
                  <TrashIcon />
                  <span>{cart.length}</span>
                </Button>
              </div>
              <Flex>
                <Button
                  color="secondary"
                  variant="bezeled"
                  onClick={() => null}
                >
                  Cobrar ${getTotalPrice()}
                </Button>
              </Flex>
            </Flex>
          </FooterCart>
        )}
      </Container>
    </>
  )
}
