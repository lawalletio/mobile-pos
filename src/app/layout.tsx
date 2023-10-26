'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'

import { LaWalletProvider } from '@/context/LaWalletContext'

import StyledComponentsRegistry from '@/lib/registry'
import { AvailableLanguages, defaultLocale } from '@/translations'

import theme from '@/styles/theme'
import { fontSecondary } from '@/styles/fonts'
import GlobalStyles from '@/styles/GlobalStyles'
import { LNProvider } from '@/context/LN'
import { NostrProvider } from '@/context/Nostr'
import { OrderProvider } from '@/context/Order'

interface ProviderProps {
  children: ReactNode
  params: { lng: AvailableLanguages }
}

// Metadata
const APP_NAME = 'LaPOS'

const Providers = (props: ProviderProps) => {
  const { children, params } = props

  return (
    <html
      lang={params.lng ?? defaultLocale}
      className={`${fontSecondary.className} touch`}
    >
      <head>
        <title>{APP_NAME}</title>
      </head>

      <body>
        <LaWalletProvider>
          <LNProvider>
            <NostrProvider>
              <OrderProvider>
                <StyledComponentsRegistry>
                  <GlobalStyles />
                  <ThemeProvider theme={theme}>{children}</ThemeProvider>
                </StyledComponentsRegistry>
              </OrderProvider>
            </NostrProvider>
          </LNProvider>
        </LaWalletProvider>
      </body>
    </html>
  )
}

export default Providers
