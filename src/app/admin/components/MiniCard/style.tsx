import { styled } from 'styled-components'

import theme from '@/styles/theme'

interface MiniCard {
  $isActive: boolean
}

export const MiniCard = styled.div<MiniCard>`
  display: flex;
  align-items: center;
  flex: 1;
  height: 80px;

  padding: 0 8px;

  background-color: ${props =>
    props.$isActive ? theme.colors.primary15 : theme.colors.error15};
  border-radius: 4px;
  border: 1px solid
    ${props => (props.$isActive ? theme.colors.primary : theme.colors.error)};
`
