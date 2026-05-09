import { test, expect } from '@playwright/test'

const ROUTES = [
  ['/', 'RoBuPRINT'],
  ['/wat-wij-doen', 'Wat wij doen'],
  ['/materialen', 'Materialen'],
  ['/projecten', 'Projecten'],
  ['/over-ons', 'Over RoBuPRINT'],
  ['/contact', 'Neem contact op'],
  ['/offerte', 'Vraag een offerte aan'],
] as const

for (const [path, expectedText] of ROUTES) {
  test(`NL ${path} renders`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByText(expectedText, { exact: false }).first()).toBeVisible()
  })
}

test('language switcher routes to /en', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'EN' }).click()
  await expect(page).toHaveURL(/\/en/)
})
