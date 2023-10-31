// Components
import Heading from '../Heading'
import Text from '../Text'
import Flex from '../Flex'
import Button from '../Button'

// Style
import { Product } from './style'

interface ProductProps {
  id: number
  category_id: number
  name: string
  description: string
  price: {
    value: number
    currency: 'SAT' | 'USD' | 'ARS'
  }
}

interface ComponentProps {
  data: any | ProductProps
  onAddToCart: (product: any) => void
  quantityInCart: number
  onRemoveOne: () => void
  onAddOne: () => void
}

export default function Component(props: ComponentProps) {
  const { data, onAddToCart, quantityInCart, onRemoveOne, onAddOne } = props

  if (!data) return null

  const { name, price } = data

  return (
    <Product>
      <Flex direction="column">
        <Heading as="h4">{name}</Heading>
        <Flex align="center" gap={4}>
          {price?.currency === 'SAT' ? <Text>SAT</Text> : <Text>$</Text>}
          <Heading as="h5">{price?.value}</Heading>
          {price?.currency !== 'SAT' && <Text size="small">ARS</Text>}
        </Flex>
      </Flex>
      <Flex align="center" justify="end" gap={8} flex={1}>
        {quantityInCart > 0 ? (
          <>
            <Button size="small" variant="bezeled" onClick={onRemoveOne}>
              -
            </Button>
            <Text>{quantityInCart}</Text>
            <Button size="small" variant="bezeled" onClick={onAddOne}>
              +
            </Button>
          </>
        ) : (
          <Button size="small" onClick={onAddToCart}>
            Añadir
          </Button>
        )}
      </Flex>
    </Product>
  )
}
