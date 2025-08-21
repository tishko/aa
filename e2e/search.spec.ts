import { expect, test } from '@playwright/test'
import { stubApi } from './api.stub'

test('search autocomplete and results navigation', async ({ page }) => {
  await stubApi(page)
  await page.goto('/')

  const input = page.getByRole('combobox', { name: /search tv shows/i })
  await input.fill('office')
  await input.press('Enter')

  // We should land on the search results page and see The Office
  await expect(page).toHaveURL(/\/search\?q=office|search/)
  await expect(page.getByRole('link', { name: /The Office/i })).toBeVisible()
})
