import { Button, Flex } from '@/components/UI'
import { GearIcon } from '@bitcoin-design/bitcoin-icons-react/filled'
import { useRouter } from 'next/navigation'

export default function Top() {
  const router = useRouter()
  return (
    <Flex direction="row" justify="end" align="center">
      <div style={{ marginRight: '8px', marginTop: '8px' }}>
        <Button onClick={() => router.push('/settings')}>
          <GearIcon />
        </Button>
      </div>
    </Flex>
  )
}
