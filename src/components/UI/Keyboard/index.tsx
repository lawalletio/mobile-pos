import { ClearCharacterIcon } from '@bitcoin-design/bitcoin-icons-react/filled'

import { Flex, Button } from '@/components/UI'
import { IUseNumpad } from '@/hooks/useNumpad'

const timeOut: Record<string, NodeJS.Timeout> = {}
type KeyboardProps = {
  numpadData: IUseNumpad
  disabled?: boolean
}

export default function Component({
  numpadData,
  disabled = false
}: KeyboardProps) {
  const { handleNumpad, resetAmount, deleteNumber } = numpadData

  const handleDeleteOnMouseDown = () =>
    (timeOut.reset = setTimeout(() => resetAmount(), 500))

  const handleDeleteOnMouseUp = () => clearTimeout(timeOut?.reset)

  return (
    <Flex direction="column" gap={8}>
      <Flex gap={8}>
        <Button
          variant="borderless"
          onClick={() => handleNumpad('1')}
          disabled={disabled}
        >
          1
        </Button>
        <Button
          variant="borderless"
          onClick={() => handleNumpad('2')}
          disabled={disabled}
        >
          2
        </Button>
        <Button
          variant="borderless"
          onClick={() => handleNumpad('3')}
          disabled={disabled}
        >
          3
        </Button>
      </Flex>
      <Flex gap={8}>
        <Button
          variant="borderless"
          onClick={() => handleNumpad('4')}
          disabled={disabled}
        >
          4
        </Button>
        <Button
          variant="borderless"
          onClick={() => handleNumpad('5')}
          disabled={disabled}
        >
          5
        </Button>
        <Button
          variant="borderless"
          onClick={() => handleNumpad('6')}
          disabled={disabled}
        >
          6
        </Button>
      </Flex>
      <Flex gap={8}>
        <Button
          variant="borderless"
          onClick={() => handleNumpad('7')}
          disabled={disabled}
        >
          7
        </Button>
        <Button
          variant="borderless"
          onClick={() => handleNumpad('8')}
          disabled={disabled}
        >
          8
        </Button>
        <Button
          variant="borderless"
          onClick={() => handleNumpad('9')}
          disabled={disabled}
        >
          9
        </Button>
      </Flex>
      <Flex gap={8}>
        <Button
          variant="borderless"
          onClick={() => handleNumpad('00')}
          disabled={disabled}
        >
          00
        </Button>
        <Button
          variant="borderless"
          onClick={() => handleNumpad('0')}
          disabled={disabled}
        >
          0
        </Button>
        <Button
          onTouchStart={handleDeleteOnMouseDown}
          onTouchEnd={handleDeleteOnMouseUp}
          onMouseDown={handleDeleteOnMouseDown}
          onMouseUp={handleDeleteOnMouseUp}
          variant="borderless"
          color="error"
          onClick={deleteNumber}
          disabled={disabled}
        >
          <ClearCharacterIcon />
        </Button>
      </Flex>
    </Flex>
  )
}
