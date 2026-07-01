import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side LNURL/LUD-16 resolver to bypass CORS restrictions.
 *
 * The browser cannot directly fetch `/.well-known/lnurlp/<user>` from
 * arbitrary domains due to CORS. This API route performs the request
 * server-side where CORS does not apply, then returns the response
 * to the client.
 *
 * Usage: GET /api/lnurl-resolve?address=user@domain.com
 *   or:  GET /api/lnurl-resolve?url=https://domain.com/.well-known/lnurlp/user
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const rawUrl = searchParams.get('url')

  let resolveUrl: string

  if (address) {
    // Parse Lightning Address (LUD-16): user@domain → https://domain/.well-known/lnurlp/user
    const parts = address.split('@')
    if (parts.length !== 2) {
      return NextResponse.json(
        { status: 'ERROR', reason: 'Invalid Lightning Address format' },
        { status: 400 }
      )
    }
    const [user, domain] = parts
    if (!user || !domain) {
      return NextResponse.json(
        { status: 'ERROR', reason: 'Invalid Lightning Address format' },
        { status: 400 }
      )
    }
    resolveUrl = `https://${domain}/.well-known/lnurlp/${user}`
  } else if (rawUrl) {
    // Direct LNURL resolve URL
    try {
      const parsed = new URL(rawUrl)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol')
      }
      resolveUrl = rawUrl
    } catch {
      return NextResponse.json(
        { status: 'ERROR', reason: 'Invalid URL' },
        { status: 400 }
      )
    }
  } else {
    return NextResponse.json(
      { status: 'ERROR', reason: 'Missing "address" or "url" parameter' },
      { status: 400 }
    )
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(resolveUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'ERROR',
          reason: `Upstream returned ${response.status}: ${response.statusText}`
        },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const message =
      (error as Error).name === 'AbortError'
        ? 'Request timed out'
        : (error as Error).message || 'Unknown error'

    return NextResponse.json(
      { status: 'ERROR', reason: `Failed to resolve LNURL: ${message}` },
      { status: 502 }
    )
  }
}
