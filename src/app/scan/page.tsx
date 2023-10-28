'use client'

// React/Next
import { useRouter } from 'next/navigation'

// Components
import QrScanner from '@/components/UI/Scanner/Scanner'
import Container from '@/components/Layout/Container'
import { Button, Divider, Flex } from '@/components/UI'

// Types
import { TransferTypes } from '@/types/transaction'

// Utils
import { detectTransferType, extractLNURLFromQR } from '@/lib/utils'

export default function Page() {
  // Hooks
  const router = useRouter()

  /** Functions */
  const handleScan = (result: any) => {
    if (!result || !result.data) return

    const decodeTransferType: TransferTypes | false = detectTransferType(
      result.data
    )
    if (!decodeTransferType) return
    const lnurl = extractLNURLFromQR(result.data)

    if (decodeTransferType === TransferTypes.INVOICE) {
      router.push(`/tree?data=${lnurl}`)
      return
    }

    router.push(`/tree?data=${lnurl}`)
  }

  return (
    <>
      <Flex justify="center" align="center" flex={1}>
        <QrScanner
          onDecode={handleScan}
          containerStyle={styleQrReader}
          startOnLaunch={true}
          highlightScanRegion={true}
          highlightCodeOutline={true}
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
