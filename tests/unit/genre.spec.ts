import { groupByGenreSorted } from '@/utils/genre'
import { describe, expect, it } from 'vitest'

describe('groupByGenreSorted', () => {
  it('groups shows by genre and sorts by rating desc', () => {
    const shows = [
      { id: 1, name: 'A', genres: ['Drama'], rating: { average: 8.2 } },
      { id: 2, name: 'B', genres: ['Drama', 'Comedy'], rating: { average: 9.1 } },
      { id: 3, name: 'C', genres: ['Comedy'], rating: { average: 7.5 } },
      { id: 4, name: 'D', genres: [], rating: { average: 0 } },
    ] as any

    const grouped = groupByGenreSorted(shows)

    expect(Object.keys(grouped).sort()).toEqual(['Comedy', 'Drama'])
    expect(grouped['Drama'].map((s) => s.name)).toEqual(['B', 'A'])
    expect(grouped['Comedy'].map((s) => s.name)).toEqual(['B', 'C'])
  })

  it('handles shows without genres gracefully', () => {
    const shows = [{ id: 1, name: 'A', genres: [], rating: { average: 8 } }] as any
    const grouped = groupByGenreSorted(shows)
    expect(grouped).toEqual({})
  })
})
