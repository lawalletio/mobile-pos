import { styled } from 'styled-components'

import theme from '@/styles/theme'

export const FooterCart = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;

  width: 100%;
  height: 60px;

  background-color: ${theme.colors.gray15};

  .clear-button {
    position: relative;

    span {
      position: absolute;
      top: -2px;
      right: -2px;

      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;

      background-color: ${theme.colors.error};
      border-radius: 50%;

      font-size: 0.6rem;
      color: ${theme.colors.background};
    }
  }
`
