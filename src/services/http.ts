export class HttpError extends Error {
  public status: number
  public url: string

  constructor(message: string, status: number, url: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.url = url
  }
}

export interface GetOptions {
  params?: Record<string, string | number | boolean | null | undefined>

  timeoutMs?: number

  signal?: AbortSignal
}

export class HttpClient {
  private readonly baseUrl: string

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  private buildUrl(path: string, params?: GetOptions['params']): string {
    const url = new URL(
      path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`,
    )

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) return
        url.searchParams.append(k, String(v))
      })
    }

    return url.toString()
  }

  async get<T>(path: string, options: GetOptions = {}): Promise<T> {
    const { params, timeoutMs = 10_000, signal } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    if (signal) {
      const onAbort = () => controller.abort(signal.reason)
      if (signal.aborted) {
        controller.abort(signal.reason)
      } else {
        signal.addEventListener('abort', onAbort, { once: true })
      }
    }

    const url = this.buildUrl(path, params)

    try {
      const res = await fetch(url, { method: 'GET', signal: controller.signal })
      if (!res.ok) {
        const bodyText = await res.text().catch(() => '')
        throw new HttpError(bodyText || `${res.status} ${res.statusText}`, res.status, url)
      }
      return (await res.json()) as T
    } finally {
      clearTimeout(timeoutId)
    }
  }

  clearCache(): void {}
}
