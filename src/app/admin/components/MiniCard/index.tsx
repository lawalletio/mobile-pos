import {
  CheckIcon,
  CrossIcon
} from '@bitcoin-design/bitcoin-icons-react/filled'

import { Flex, Icon, Text } from '@/components/UI'

import theme from '@/styles/theme'
import { MiniCard } from './style'

interface ComponentProps {
  isActive: boolean
  title: string
}

export default function Component(props: ComponentProps) {
  const { isActive, title } = props

  return (
    <MiniCard $isActive={isActive}>
      <Flex direction="column" align="center" justify="center" gap={4}>
        <Icon color={isActive ? theme.colors.primary : theme.colors.error}>
          {isActive ? <CheckIcon /> : <CrossIcon />}
        </Icon>
        <Text size="small">{title}</Text>
      </Flex>
    </MiniCard>
  )
}
