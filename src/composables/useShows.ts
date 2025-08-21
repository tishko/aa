import { computed, ref } from 'vue'

import type { Show } from '@/services/tvmaze'
import { fetchShowsIndex } from '@/services/tvmaze'
import { groupByGenreSorted } from '@/utils/genre'

const loading = ref(false)
const error = ref<string | null>(null)
const allShows = ref<Show[]>([])
const genreBuckets = ref<Record<string, Show[]>>({})
const hasMore = ref(true)

const nextPage = ref(0)
const initialized = ref(false)

const topGenres = computed(() => Object.keys(genreBuckets.value))

async function init(force = false) {
  if (initialized.value && !force) return

  try {
    loading.value = true
    error.value = null

    const initialPages = [0, 1, 2, 3, 4, 5]
    const initial = await fetchShowsIndex(initialPages)

    const map = new Map<number, Show>()
    initial.forEach((show) => map.set(show.id, show))
    allShows.value = Array.from(map.values())

    nextPage.value = Math.max(...initialPages) + 1
    hasMore.value = true
    genreBuckets.value = groupByGenreSorted(allShows.value)
    initialized.value = true
  } catch (e: unknown) {
    if ((e as any)?.name === 'AbortError') return
    error.value = e instanceof Error ? e.message : 'Failed to load shows'
  } finally {
    loading.value = false
  }
}

async function loadMore(count = 1) {
  if (!hasMore.value || loading.value) return
  try {
    loading.value = true
    error.value = null

    const start = nextPage.value
    const pages = Array.from({ length: count }, (_, i) => start + i)

    const next = await fetchShowsIndex(pages)
    if (next.length === 0) {
      hasMore.value = false
      return
    }

    const map = new Map<number, Show>(allShows.value.map((s) => [s.id, s]))
    next.forEach((s) => map.set(s.id, s))
    allShows.value = Array.from(map.values())

    nextPage.value = start + count
    genreBuckets.value = groupByGenreSorted(allShows.value)
  } catch (e: unknown) {
    if ((e as any)?.name === 'AbortError') return
    error.value = e instanceof Error ? e.message : 'Failed to load more shows'
  } finally {
    loading.value = false
  }
}

export function useShows() {
  return {
    loading,
    error,
    hasMore,
    genreBuckets,
    topGenres,
    init,
    loadMore,
  }
}
