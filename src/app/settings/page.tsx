'use client'

// React/Next
import { useEffect, useMemo, useState } from 'react'

// Components
import { Flex, Heading, Text, Divider, Button } from '@/components/UI'
import Container from '@/components/Layout/Container'
import Navbar from '@/components/Layout/Navbar'
import Input from '@/components/UI/Input'

// Contexts and Hooks
import {
  cleanRelays,
  DEFAULT_NOSTR_RELAYS,
  SUGGESTED_NOSTR_RELAYS
} from '@/context/Nostr'

// Thirdparty
import theme from '@/styles/theme'
import { useLocalStorage } from 'react-use-storage'

export default function Page() {
  // Hooks
  const [nostrRelays, setNostrRelays] = useLocalStorage<string[]>(
    'nostrRelays',
    DEFAULT_NOSTR_RELAYS
  )
  const [tipEnabled, setTipEnabled] = useLocalStorage<boolean>(
    'tipEnabled',
    false
  )
  // Generate random private key

  const [, forceUpdate] = useState(0)
  const [customRelay, setCustomRelay] = useState('')
  const selectedRelays = useMemo(() => cleanRelays(nostrRelays), [nostrRelays])
  const suggestedRelays = useMemo(
    () => cleanRelays(SUGGESTED_NOSTR_RELAYS),
    []
  )

  useEffect(() => {
    // Ensure the component re-renders after mounting
    forceUpdate(n => n + 1)
  }, [])

  /** Functions */
  const toggleRelay = (relay: string) => {
    const nextRelays = selectedRelays.includes(relay)
      ? selectedRelays.filter(selectedRelay => selectedRelay !== relay)
      : [...selectedRelays, relay]

    if (nextRelays.length === 0) {
      alert('Selecciona al menos un relay.')
      return
    }

    setNostrRelays(nextRelays)
  }

  const addCustomRelay = () => {
    const relay = cleanRelays([customRelay])[0]
    if (!relay) return

    setNostrRelays(cleanRelays([...selectedRelays, relay]))
    setCustomRelay('')
  }

  return (
    <>
      <Navbar showBackPage={true}>
        <Heading as="h5">Settings</Heading>
      </Navbar>
      <Container size="small">
        <Flex direction="column" align="center" flex={1} gap={16}>
          <Flex direction="row" align="center" justify="space-between" gap={16}>
            <Flex direction="column" gap={4}>
              <Heading as="h5">Tip</Heading>
              <Text color={theme.colors.gray50} size="small">
                Mostrar pantalla de propina antes de cobrar.
              </Text>
            </Flex>
            <input
              style={{
                width: '40px',
                height: '40px'
              }}
              onChange={e => setTipEnabled(e.target.checked)}
              checked={tipEnabled}
              type="checkbox"
            />
          </Flex>

          <Flex direction="column" gap={16}>
            <Flex direction="column" gap={4}>
              <Heading as="h5">Relays Nostr</Heading>
              <Text color={theme.colors.gray50} size="small">
                Seleccionados: {selectedRelays.length}
              </Text>
            </Flex>

            <Flex direction="column" gap={8}>
              {suggestedRelays.map(relay => (
                <Flex
                  key={relay}
                  direction="row"
                  align="center"
                  justify="space-between"
                  gap={8}
                >
                  <Text size="small">{relay}</Text>
                  <input
                    style={{
                      width: '32px',
                      height: '32px'
                    }}
                    onChange={() => toggleRelay(relay)}
                    checked={selectedRelays.includes(relay)}
                    type="checkbox"
                  />
                </Flex>
              ))}
            </Flex>

            <Flex direction="column" gap={8}>
              <Input
                value={customRelay}
                onChange={e => setCustomRelay(e.target.value.trim())}
                placeholder="wss://relay.example.com"
              />
              <Flex gap={8}>
                <Button variant="bezeledGray" onClick={addCustomRelay}>
                  Agregar relay
                </Button>
                <Button
                  variant="bezeledGray"
                  onClick={() => setNostrRelays(DEFAULT_NOSTR_RELAYS)}
                >
                  Reset
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Divider y={24} />
      </Container>
    </>
  )
}
