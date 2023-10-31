import React from 'react'

declare global {
  interface Window {
    Android?: {
      print: (str: string) => void
    }
  }
}
