'use client'

// React/Next
import { useRouter } from 'next/navigation'

// Components
import QrScanner from '@/components/UI/Scanner/Scanner'
import Container from '@/components/Layout/Container'
import { Button, Divider, Flex, Heading } from '@/components/UI'

// Types
import { TransferTypes } from '@/types/transaction'

// Utils
import { detectTransferType, removeLightningStandard } from '@/lib/utils'
import Navbar from '@/components/Layout/Navbar'
import { useEffect } from 'react'

export default function Page() {
  // Hooks
  const router = useRouter()

  /** Functions */
  const handleScan = (result: any) => {
    if (!result || !result.data) return

    const cleanScan: string = removeLightningStandard(result.data)
    const scanType: boolean | string = detectTransferType(cleanScan)
    if (!scanType) return

    if (scanType === TransferTypes.INVOICE) {
      // router.push(`/tree?data=${cleanScan}`)
      return
    }

    router.push(`/tree?data=${cleanScan}`)
  }

  useEffect(() => {
    router.prefetch('/tree')
  }, [router])

  return (
    <>
      <Navbar showBackPage={true}>
        <Flex align="center">
          <Heading as="h5">Escanea el código QR</Heading>
        </Flex>
      </Navbar>

      <Flex justify="center" align="center" flex={1}>
        <QrScanner
          onDecode={handleScan}
          startOnLaunch={true}
          highlightScanRegion={true}
          highlightCodeOutline={true}
          constraints={{ facingMode: 'environment' }}
          preferredCamera={'environment'}
        />
      </Flex>

      <Flex>
        <Container size="small">
          <Divider y={16} />
          <Flex gap={8}>
            <Button variant="bezeledGray" onClick={() => router.push('/tree')}>
              Cancelar
            </Button>
          </Flex>
          <Divider y={32} />
        </Container>
      </Flex>
    </>
  )
}

const styleQrReader = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '500px',
  height: '100%'
}
