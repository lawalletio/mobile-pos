'use client'

// React/Next
import { useEffect, useState } from 'react'

// Components
import { Flex, Heading, Text, Divider, Card } from '@/components/UI'
import Container from '@/components/Layout/Container'
import Navbar from '@/components/Layout/Navbar'

// Contexts and Hooks
import { useProxy } from '@/context/Proxy'

// Thirdparty
import theme from '@/styles/theme'

export default function Page() {
  // Hooks
  const { isEnabled, proxyPrivateKey, enableProxy, disableProxy } = useProxy()
  // Generate random private key

  const [, forceUpdate] = useState(0)

  useEffect(() => {
    // Ensure the component re-renders after mounting
    forceUpdate(n => n + 1)
  }, [])

  /** Functions */
  return (
    <>
      <Navbar showBackPage={true}>
        <Heading as="h5">Settings</Heading>
      </Navbar>
      <Container size="small">
        <Flex direction="column" align="center" flex={1} gap={16}>
          <Flex direction="row" align="center" justify="space-between" gap={16}>
            <Text color={theme.colors.gray50} size="normal">
              Proxy:
            </Text>
            <input
              style={{
                width: '40px',
                height: '40px'
              }}
              onChange={e => {
                console.log('Checkbox changed:', e.target.checked)
                e.target.checked ? enableProxy() : disableProxy()
              }}
              checked={isEnabled}
              type="checkbox"
            />
          </Flex>
          {isEnabled && (
            <Flex
              direction="row"
              align="center"
              justify="space-between"
              gap={16}
            >
              <Text color={theme.colors.gray50} size="normal">
                Proxy Private Key:
              </Text>
              <input
                style={{
                  height: '40px'
                }}
                defaultValue={proxyPrivateKey}
                type="text"
              />
            </Flex>
          )}
        </Flex>
        <Divider y={24} />
      </Container>
    </>
  )
}
