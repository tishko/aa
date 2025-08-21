import { HttpClient, HttpError } from '@/services/http'
import { describe, expect, it, vi } from 'vitest'

describe('HttpClient', () => {
  it('builds URLs with params and returns JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as any)
    globalThis.fetch = fetchMock

    const http = new HttpClient('https://api.example.com')
    const res = await http.get<{ ok: boolean }>('/shows', { params: { page: 2, q: 'foo' } })
    expect(res.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = new URL(fetchMock.mock.calls[0][0] as string)
    expect(url.toString()).toContain('https://api.example.com/shows')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('q')).toBe('foo')
  })

  it('throws HttpError on non-2xx', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'server failed',
    } as any)

    const http = new HttpClient('https://api.example.com')
    await expect(http.get('/boom')).rejects.toBeInstanceOf(HttpError)
    await http.get('/boom').catch((e: HttpError) => {
      expect(e.status).toBe(500)
      expect(e.url).toContain('https://api.example.com/boom')
      expect(e.message).toContain('server failed')
    })
  })

  it('aborts after timeout', async () => {
    vi.useFakeTimers()
    // fetch that never resolves but rejects on signal abort
    // @ts-expect-error override
    globalThis.fetch = vi.fn((_url: string, init?: RequestInit) => {
      const signal = init?.signal as AbortSignal | undefined
      return new Promise((_resolve, reject) => {
        if (signal) {
          const onAbort = () => reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
          if (signal.aborted) reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
          else signal.addEventListener('abort', onAbort, { once: true })
        }
      })
    })

    const http = new HttpClient('https://api.example.com')
    const p = http.get('/slow', { timeoutMs: 20 })

    // attach a catch handler early to prevent unhandled rejection warnings in jsdom
    p.catch(() => {})

    await vi.advanceTimersByTimeAsync(25)
    await expect(p).rejects.toMatchObject({ name: 'AbortError' })
    vi.useRealTimers()
  })

  it('respects external AbortSignal', async () => {
    // fetch that never resolves but rejects on signal abort
    // @ts-expect-error override
    globalThis.fetch = vi.fn((_url: string, init?: RequestInit) => {
      const signal = init?.signal as AbortSignal | undefined
      return new Promise((_resolve, reject) => {
        if (signal) {
          const onAbort = () => reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
          if (signal.aborted) reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
          else signal.addEventListener('abort', onAbort, { once: true })
        }
      })
    })
    const controller = new AbortController()

    const http = new HttpClient('https://api.example.com')
    const p = http.get('/slow', { signal: controller.signal, timeoutMs: 10_000 })
    // attach a catch handler early to prevent unhandled rejection warnings in jsdom
    p.catch(() => {})
    controller.abort()

    await expect(p).rejects.toMatchObject({ name: 'AbortError' })
  })
})
