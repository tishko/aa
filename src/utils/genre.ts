import type { Show } from '@/services/tvmaze'

export function groupByGenreSorted(shows: Show[]): Record<string, Show[]> {
  const result: Record<string, Show[]> = {}

  for (const show of shows) {
    if (!show.genres?.length) continue
    for (const genre of show.genres) {
      if (genre) (result[genre] ||= []).push(show)
    }
  }

  for (const genre in result) {
    result[genre].sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0))
  }

  return result
}
