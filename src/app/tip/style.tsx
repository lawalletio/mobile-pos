'use client'

import { styled } from 'styled-components'

import theme from '@/styles/theme'

export const TipMessage = styled.h1`
  margin: 0;
  width: 100%;

  color: ${theme.colors.white};
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
`

export const TipSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;

  padding: 16px;

  background-color: ${theme.colors.gray15};
  border-radius: 8px;
`

export const TipOptionButton = styled.button<{ $isSkip?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 72px;

  padding: 16px;

  border: none;
  border-radius: 8px;
  background-color: ${props =>
    props.$isSkip ? theme.colors.gray15 : theme.colors.primary};

  color: ${props => (props.$isSkip ? theme.colors.white : theme.colors.black)};
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.75;
  }
`

export const TipOptionPercent = styled.span`
  font-size: 1.2em;
  font-weight: 700;
  text-align: left;
`

export const TipOptionAmount = styled.span`
  font-size: 0.9em;
  font-weight: 700;
  flex-shrink: 0;
  text-align: right;
`
