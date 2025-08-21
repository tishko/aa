// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/tvmaze', async (orig) => {
  return {
    ...(await orig()),
    fetchShowsIndex: vi.fn(async (pages: number[]) => {
      // return predictable data across pages
      const all: any[] = []
      for (const p of pages) {
        all.push(
          { id: p * 10 + 1, name: `S${p}-1`, genres: ['Drama'], rating: { average: 8 } },
          { id: p * 10 + 2, name: `S${p}-2`, genres: ['Comedy'], rating: { average: 9 } },
          // a duplicate id to test de-dup
          { id: 100, name: `DupFrom${p}`, genres: ['Drama'], rating: { average: 5 } },
        )
      }
      return all
    }),
  }
})

describe('useShows composable', () => {
  beforeEach(() => {
    // Reload module to reset shared state between tests
    vi.resetModules()
  })

  it('init() preloads pages and prepares genre buckets', async () => {
    const { init, topGenres, genreBuckets, loading, hasMore } = (
      await import('@/composables/useShows')
    ).useShows()
    const p = init()
    expect(loading.value).toBe(true)
    await p
    expect(loading.value).toBe(false)
    expect(hasMore.value).toBe(true)
    expect(topGenres.value.sort()).toEqual(['Comedy', 'Drama'])
    expect(genreBuckets.value['Comedy'].length).toBeGreaterThan(0)
  })

  it('loadMore() appends pages and keeps unique shows', async () => {
    const api = (await import('@/composables/useShows')).useShows()
    await api.init()
    const beforeDramaCount = api.genreBuckets.value['Drama'].length
    await api.loadMore(2)
    // Drama should grow, but duplicates with id 100 should be collapsed
    expect(api.genreBuckets.value['Drama'].length).toBeGreaterThan(beforeDramaCount)
    const allIds = new Set(
      Object.values(api.genreBuckets.value)
        .flat()
        .map((s) => s.id),
    )
    expect(allIds.has(100)).toBe(true)
  })

  it('init() is idempotent without force', async () => {
    const api = (await import('@/composables/useShows')).useShows()
    await api.init()
    const snapshot = JSON.stringify(api.genreBuckets.value)
    await api.init() // should not reload
    const snapshot2 = JSON.stringify(api.genreBuckets.value)
    expect(snapshot2).toBe(snapshot)
  })
})
