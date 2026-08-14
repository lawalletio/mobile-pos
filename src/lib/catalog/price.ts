import { CurrenciesList, type AvailableCurrencies } from '@/types/config'

export type Currency = AvailableCurrencies

export function isSupportedCurrency(v: string): v is Currency {
  return (CurrenciesList as readonly string[]).includes(v)
}

export interface Price {
  amount: number
  currency: string
  frequency?: string
}

const SATS_PER_BTC = 100_000_000

/**
 * Parse a NIP-99 `["price", "<amount>", "<currency>", "<frequency>?"]` tag.
 * `btc` becomes SAT; matching is case-insensitive.
 */
export function parsePriceTag(tag: string[] | undefined): Price | null {
  if (!tag || tag[0] !== 'price') return null

  const rawAmount = tag[1]
  const rawCurrency = tag[2]
  if (!rawAmount || !rawCurrency) return null

  const normalised = rawAmount.includes(',')
    ? rawAmount.replace(/\./g, '').replace(',', '.')
    : rawAmount
  const amount = Number.parseFloat(normalised)
  if (!Number.isFinite(amount) || amount < 0) return null

  const frequency = tag[3] || undefined
  const c = rawCurrency.trim().toUpperCase()

  if (c === 'BTC') {
    return {
      amount: Math.round(amount * SATS_PER_BTC),
      currency: 'SAT',
      frequency
    }
  }
  if (c === 'SAT' || c === 'SATS') {
    return { amount: Math.round(amount), currency: 'SAT', frequency }
  }
  return { amount, currency: c, frequency }
}
