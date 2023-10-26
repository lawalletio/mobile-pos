import { styled } from 'styled-components'

import theme from '@/styles/theme'

interface CardProps {
  $color: 'primary' | 'secondary'
}

export const Card = styled.div<CardProps>`
  width: 100%;
  height: 200px;

  padding: 8px 16px;

  background-color: ${props => theme.colors[props.$color]};
  border-radius: 12px;

  a {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 100%;

    color: ${theme.colors.black};
    text-decoration: none;

    > div {
      &:first-child {
        width: 50px;
        height: 50px;

        background-color: ${theme.colors.white};
        border-radius: 50px;

        svg {
          width: 24px;
          height: 24px;
        }
      }
    }
  }
`
