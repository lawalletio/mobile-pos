'use client'

import { ReactNode } from 'react'
import Script from 'next/script'
import { ThemeProvider } from 'styled-components'

import { LaWalletProvider } from '@/context/LaWalletContext'

import StyledComponentsRegistry from '@/lib/registry'

import theme from '@/styles/theme'
import { fontSecondary } from '@/styles/fonts'
import GlobalStyles from '@/styles/GlobalStyles'

interface ProviderProps {
  children: ReactNode
}

// Metadata
const APP_NAME = 'LaPOS'

const Providers = (props: ProviderProps) => {
  const { children } = props

  return (
    <html lang={'es'} className={`${fontSecondary.className} touch`}>
      <head>
        <title>{APP_NAME}</title>
      </head>

      <body>
        <LaWalletProvider>
          <StyledComponentsRegistry>
            <GlobalStyles />
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </StyledComponentsRegistry>
        </LaWalletProvider>
      </body>
    </html>
  )
}

export default Providers
