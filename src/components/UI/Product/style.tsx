import { styled } from 'styled-components'

import theme from '@/styles/theme'

export const Product = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  padding: 12px 0;

  border-bottom: 1px solid ${theme.colors.gray20};

  &:last-child {
    border-bottom: none;
  }
`
