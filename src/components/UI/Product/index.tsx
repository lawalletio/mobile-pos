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
      <Flex direction="column" gap={4}>
        <Text isBold>{name}</Text>
        <Flex align="start" gap={4}>
          <Flex flex={0}>
            {price?.currency !== 'SAT' && <Text size="small">$</Text>}
            <Heading as="h5">{price?.value}</Heading>
          </Flex>
          {price?.currency !== 'SAT' && <Text size="small">ARS</Text>}
        </Flex>
      </Flex>
      <Flex align="center" justify="end" gap={8} flex={1}>
        {quantityInCart > 0 ? (
          <>
            <Button
              size="small"
              color="secondary"
              variant="bezeled"
              onClick={onRemoveOne}
            >
              -
            </Button>
            <Text>{quantityInCart}</Text>
            <Button size="small" variant="bezeled" onClick={onAddOne}>
              +
            </Button>
          </>
        ) : (
          <Button size="small" onClick={onAddToCart}>
            Agregar
          </Button>
        )}
      </Flex>
    </Product>
  )
}
