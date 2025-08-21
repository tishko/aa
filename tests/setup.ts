import { config } from '@vue/test-utils'
import { afterEach, vi } from 'vitest'

// Silence Vue warnings in tests unless important
config.global.stubs = {}

// Reset fetch mocks between tests
afterEach(() => {
  vi.restoreAllMocks()
})
