import { Page } from '@playwright/test'
import searchOffice from './fixtures/search_office.json'
import show1 from './fixtures/show_1_detail.json'
import shows0 from './fixtures/shows_page_0.json'
import shows1 from './fixtures/shows_page_1.json'

export async function stubApi(page: Page) {
  await page.route('**/shows?**', async (route) => {
    const url = new URL(route.request().url())
    const p = url.searchParams.get('page') ?? '0'
    if (p === '0') return route.fulfill({ json: shows0 })
    if (p === '1') return route.fulfill({ json: shows1 })
    return route.fulfill({ json: [] })
  })

  await page.route('**/search/shows?**', async (route) => {
    const url = new URL(route.request().url())
    const q = url.searchParams.get('q') ?? ''
    if (q.toLowerCase().includes('office')) return route.fulfill({ json: searchOffice })
    return route.fulfill({ json: [] })
  })

  await page.route('**/shows/1?**', async (route) => {
    return route.fulfill({ json: show1 })
  })
}
