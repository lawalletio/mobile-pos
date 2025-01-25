import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transferencia - LaPOS'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
