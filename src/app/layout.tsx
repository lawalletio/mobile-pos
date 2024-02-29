'use client'

import { ReactNode } from 'react'
import { LaWalletProvider } from '@/context/LaWalletContext'

import StyledComponentsRegistry from '@/lib/registry'
import { AvailableLanguages, defaultLocale } from '@/translations'

import { fontSecondary } from '@/styles/fonts'
import { LNProvider } from '@/context/LN'
import { NostrProvider } from '@/context/Nostr'
import { OrderProvider } from '@/context/Order'
import { InjectedNFCProvider } from '@/context/InjectedNFC'

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
        <meta name="application-name" content={APP_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1C1C1C" />

        <link rel="manifest" href="/manifest.json" />
      </head>

      <body>
        <StyledComponentsRegistry>
          <InjectedNFCProvider>
            <LaWalletProvider>
              <LNProvider>
                <NostrProvider>
                  <OrderProvider>{children}</OrderProvider>
                </NostrProvider>
              </LNProvider>
            </LaWalletProvider>
          </InjectedNFCProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}

export default Providers
