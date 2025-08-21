import { expect, test } from '@playwright/test'
import { stubApi } from './api.stub'

test('home shows genre shelves and loads more on scroll', async ({ page }) => {
  await stubApi(page)
  await page.goto('/')

  // Wait for a shelf heading (genre)
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()

  // Verify a known show card is visible
  await expect(page.getByRole('link', { name: /A Show/i })).toBeVisible()

  // Scroll to bottom to trigger loadMore
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  // A show from page 1 should appear
  await expect(page.getByRole('link', { name: /E Show/i })).toBeVisible()
})
