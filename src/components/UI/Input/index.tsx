'use client'

import { ChangeEventHandler } from 'react'
import { InputCustom } from './style'

interface InputProps {
  placeholder?: string
  disabled?: boolean
  value?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
}

export default function Input(props: InputProps) {
  return <InputCustom type="text" {...props} />
}
