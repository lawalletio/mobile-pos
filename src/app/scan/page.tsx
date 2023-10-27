'use client'

import Container from '@/components/Layout/Container'
import { Button, Divider, Flex } from '@/components/UI'
import { useRouter } from 'next/navigation'
import QrScanner from '@/components/UI/Scanner/Scanner'
import { TransferTypes } from '@/types/transaction'
import { detectTransferType } from '@/lib/utils'

export default function Page() {
  const router = useRouter()

  const handleScan = (result: any) => {
    if (!result || !result.data) return

    const decodeTransferType: TransferTypes | false = detectTransferType(
      result.data
    )
    if (!decodeTransferType) return

    if (decodeTransferType === TransferTypes.INVOICE) {
      router.push(`/tree?data=${result.data}`)
      return
    }

    router.push(`/tree?data=${result.data}`)
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
