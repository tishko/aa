import { expect, test } from '@playwright/test'
import { stubApi } from './api.stub'

test('navigates to detail page and shows cast & episodes', async ({ page }) => {
  await stubApi(page)
  await page.goto('/')

  // Click the first card (links to /show/1 in our fixtures)
  await page.getByRole('link', { name: /A Show/i }).click()

  await expect(page).toHaveURL(/\/show\/\d+/)
  await expect(page.getByText(/Cast/i)).toBeVisible()
  await expect(page.getByText(/Episodes/i)).toBeVisible()
})
