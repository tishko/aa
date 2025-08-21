import * as mod from '@/services/tvmaze'
import { describe, expect, it, vi } from 'vitest'

function mockFetchOnce(json: any) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => json,
  } as any)
}

describe('tvmaze service', () => {
  it('fetchShowsPage requests correct page', async () => {
    mockFetchOnce([{ id: 1 }])
    const result = await mod.fetchShowsPage(3)
    expect(result).toEqual([{ id: 1 }])
    const url = new URL((globalThis.fetch as any).mock.calls[0][0] as string)
    expect(url.pathname).toBe('/shows')
    expect(url.searchParams.get('page')).toBe('3')
  })

  it('searchShows maps hits to shows', async () => {
    mockFetchOnce([{ score: 12, show: { id: 7, name: 'X' } }])
    const res = await mod.searchShows('office')
    expect(res).toEqual([{ id: 7, name: 'X' }])
    const url = new URL((globalThis.fetch as any).mock.calls[0][0] as string)
    expect(url.pathname).toBe('/search/shows')
    expect(url.searchParams.get('q')).toBe('office')
  })

  it('getShow requests with embed params', async () => {
    mockFetchOnce({ id: 7, _embedded: { cast: [], episodes: [] } })
    const res = await mod.getShow(7)
    expect(res.id).toBe(7)
    const url = new URL((globalThis.fetch as any).mock.calls[0][0] as string)
    expect(url.pathname).toBe('/shows/7')
    // allow either ordering of embed[] params
    const params = Array.from(url.searchParams.keys())
    expect(params.filter((p) => p.startsWith('embed'))).toHaveLength(2)
  })

  it('fetchShowsIndex merges and dedupes by id', async () => {
    // two pages with an overlap
    const page0 = [{ id: 1 }, { id: 2 }]
    const page1 = [{ id: 2 }, { id: 3 }]
    const mock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => page0 })
      .mockResolvedValueOnce({ ok: true, json: async () => page1 })
    globalThis.fetch = mock

    const res = await mod.fetchShowsIndex([0, 1])
    expect(res.map((s) => s.id)).toEqual([1, 2, 3])
  })
})
