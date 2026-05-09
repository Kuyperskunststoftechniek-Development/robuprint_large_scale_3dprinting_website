import { defineConfig } from '@playwright/test'

const PORT = Number(process.env.PLAYWRIGHT_PORT || 3010)

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    port: PORT,
    timeout: 180_000,
    reuseExistingServer: true,
  },
})
