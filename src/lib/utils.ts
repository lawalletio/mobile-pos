// Libs
import bolt11 from 'bolt11'

// Types
import type { IOrderEventContent } from '@/types/order'
import { TransferTypes } from '@/types/transaction'
import {
  getPublicKey,
  type Event,
  type UnsignedEvent,
  finalizeEvent
} from 'nostr-tools'
import { ProductData, ProductQtyData } from '@/types/product'
import { requestPayServiceParams } from 'lnurl-pay'
import { LNURLResponse } from '@/types/lnurl'
import { NDKKind } from '@nostr-dev-kit/ndk'
import { utils } from 'lnurl-pay'
import axios from 'axios'
import { ScanAction } from '@/types/card'
import { hexToBytes } from '@noble/hashes/utils'

export const FEDERATION_ID = process.env.NEXT_PUBLIC_FEDERATION_ID!

export const parseOrderDescription = (event: Event): IOrderEventContent => {
  return JSON.parse(
    event.tags.find(tag => tag[0] === 'description')![1]!
  ) as IOrderEventContent
}

export const parseOrderProducts = (event: Event): ProductQtyData[] => {
  return JSON.parse(
    event.tags.find(tag => tag[0] === 'products')?.[1] ?? '[]'
  ) as ProductQtyData[]
}

export const parseZapInvoice = (event: Event): bolt11.PaymentRequestObject => {
  const paidInvoice = event.tags.find(tag => tag[0] === 'bolt11')?.[1]
  return bolt11.decode(paidInvoice!)
}

export const validateEmail = (email: string): RegExpMatchArray | null => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
}

export const requestCardEndpoint = async (url: string, type: ScanAction) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-LaWallet-Action': type,
    'X-LaWallet-Param': `federationId=${FEDERATION_ID}`
  }

  // switch (type) {
  //   case ScanAction.INFO:
  //     return getMockInfo()
  //     break

  //   case ScanAction.RESET:
  //     return getMockReset()
  //     break

  //   default:
  //     throw new Error('Invalid ScanAction')
  //     break
  // }

  // alert('headers: ' + JSON.stringify(headers))
  const response = await axios.get(url, {
    headers: headers
  })

  if (response.status < 200 || response.status >= 300) {
    // alert(JSON.stringify(response.data))
    throw new Error('Hubo un error: ' + JSON.stringify(response.data))
  }

  return response.data
}

export const detectTransferType = (data: string): TransferTypes | false => {
  const upperStr: string = data.toUpperCase()
  const isLUD16 = validateEmail(upperStr)
  if (isLUD16) return TransferTypes.LUD16

  if (upperStr.startsWith('LNURL')) return TransferTypes.LNURL
  if (upperStr.startsWith('LNBC')) return TransferTypes.INVOICE

  return false
}

export const isValidLightningURL = (url: string): boolean => {
  const pattern = /^lightning:\/\/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return pattern.test(url)
}

export const removeLightningStandard = (str: string) => {
  const lowStr: string = str.toLowerCase()

  return lowStr.startsWith('lightning://')
    ? lowStr.replace('lightning://', '')
    : lowStr.startsWith('lightning:')
      ? lowStr.replace('lightning:', '')
      : lowStr
}

export const aggregateProducts = (
  products: ProductData[]
): ProductQtyData[] => {
  const productMap = new Map<string, ProductQtyData>()

  products.forEach(product => {
    const key = `${product.id}`
    const existingProduct = productMap.get(key)
    if (existingProduct) {
      existingProduct.qty += 1
    } else {
      const newProduct: ProductQtyData = {
        ...product,
        qty: 1
      }
      productMap.set(key, newProduct)
    }
  })

  return Array.from(productMap.values())
}

export function isValidUrl(urlString: string): boolean {
  const expression =
    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
  const regex = new RegExp(expression)

  return !!urlString.match(regex)
}

export async function fetchLNURL(lnurl: string): Promise<LNURLResponse> {
  console.info('fetchLNURL')
  console.info(lnurl)
  console.info('requestPayServiceParams')
  return (
    await requestPayServiceParams({
      lnUrlOrAddress: lnurl
    })
  ).rawData as unknown as LNURLResponse
}

interface InternalTransactionEventParams {
  privateKey: string
  k1: string
  destinationPubKey: string
  relays: string[]
  amount: number
}

export function generateInternalTransactionEvent({
  privateKey,
  k1,
  destinationPubKey,
  relays,
  amount
}: InternalTransactionEventParams) {
  const publicKey = getPublicKey(hexToBytes(privateKey))
  const unsignedEvent: UnsignedEvent = {
    kind: 1112 as NDKKind,
    content: JSON.stringify({
      k1,
      pubkey: destinationPubKey,
      tokens: {
        BTC: amount
      }
    }),
    pubkey: publicKey,
    created_at: Math.round(Date.now() / 1000),
    tags: [
      ['relays', ...relays!],
      ['p', publicKey],
      ['t', 'order']
    ] as string[][]
  }

  const event = finalizeEvent(unsignedEvent, hexToBytes(privateKey))

  return event
}

export function parseQueryParams(url: string): Record<string, string | null> {
  const urlObj = new URL(url)
  const queryParams = new URLSearchParams(urlObj.search)
  const params: Record<string, string | null> = {}

  queryParams.forEach((value, key) => {
    params[key] = value
  })

  return params
}

export function normalizeLNURL(lnurl: string): string {
  return isValidUrl(lnurl)
    ? lnurl
    : utils.decodeUrlOrAddress(removeLightningStandard(lnurl))!
}

export function extractEmailParts(email: string): {
  username: string | null
  domain: string | null
} {
  const regex = /^([^@]+)@(.+)$/
  const match = email.match(regex)
  return {
    username: match ? match[1] : null,
    domain: match ? match[2] : null
  }
}
