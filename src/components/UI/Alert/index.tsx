'use client'

import {
  CheckIcon,
  AlertIcon
} from '@bitcoin-design/bitcoin-icons-react/filled'

import theme from '@/styles/theme'

import Text from '../Text'
import Icon from '../Icon'

import { Alert } from './style'

interface AlertProps {
  title: string | undefined
  description: string | undefined
  type: 'success' | 'warning' | 'error' | undefined
  isOpen: boolean
}

export default function Component(props: AlertProps) {
  const { title, description, type, isOpen = false } = props

  const isSuccess = type === 'success'

  return (
    <Alert
      $background={type && theme.colors[`${type}15`]}
      $color={type && theme.colors[type]}
      $isOpen={!!isOpen}
    >
      <div className="box">
        <Icon size="small">{isSuccess ? <CheckIcon /> : <AlertIcon />}</Icon>
        <div>
          {title && (
            <Text size="small" isBold>
              {title}
            </Text>
          )}
          {description && <Text size="small">{description}</Text>}
        </div>
        <div className="progress"></div>
      </div>
    </Alert>
  )
}
