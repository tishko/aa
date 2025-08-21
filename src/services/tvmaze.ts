import { API_BASE } from '@/common/constants'
import { HttpClient } from './http'

export interface TvMazeShow {
  id: number
  name: string
  genres: string[]
  rating: { average: number | null }
  image?: { medium: string; original: string }
  summary?: string
  language?: string
  premiered?: string | null
  ended?: string | null
  status?: string
}

export interface TvMazeSearchHit {
  score: number
  show: TvMazeShow
}

export interface TvMazeShowDetail extends TvMazeShow {
  _embedded?: {
    cast?: Array<{ person: { name: string }; character: { name: string } }>
    episodes?: Array<{ id: number; name: string; season: number; number: number; airdate: string }>
  }
  network?: { name: string } | null
  webChannel?: { name: string } | null
  officialSite?: string | null
}

export type Show = TvMazeShow
export type ShowDetail = TvMazeShowDetail

const http = new HttpClient(API_BASE)

export async function fetchShowsPage(page: number): Promise<Show[]> {
  return await http.get<Show[]>('/shows', {
    params: { page },
    timeoutMs: 10_000,
  })
}

export async function fetchShowsIndex(pages: number[] = [0, 1, 2, 3]): Promise<Show[]> {
  const results = await Promise.all(pages.map((p) => fetchShowsPage(p)))
  const uniq = new Map<number, Show>()
  results.flat().forEach((s) => uniq.set(s.id, s))
  return Array.from(uniq.values())
}

export async function searchShows(q: string, opts?: { signal?: AbortSignal }): Promise<Show[]> {
  const hits = await http.get<TvMazeSearchHit[]>('/search/shows', {
    params: { q },
    timeoutMs: 10_000,
    signal: opts?.signal,
  })
  return hits.map((h) => h.show)
}

export async function getShow(id: number): Promise<ShowDetail> {
  return await http.get<ShowDetail>(`/shows/${id}?embed[]=cast&embed[]=episodes`, {
    timeoutMs: 12_000,
  })
}
