import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Arbolito - LaPOS'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
