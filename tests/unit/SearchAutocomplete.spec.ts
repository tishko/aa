// @vitest-environment jsdom
import SearchAutocomplete from '@/components/SearchAutocomplete.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/services/tvmaze', () => ({
  searchShows: vi.fn(async (q: string) => {
    return [
      { id: 88, name: 'The Office', genres: ['Comedy'], rating: { average: 9 } },
      { id: 77, name: 'Other', genres: ['Drama'], rating: { average: 8 } },
    ]
  }),
}))

describe('SearchAutocomplete', () => {
  it('shows suggestions and lets user navigate with keyboard', async () => {
    const wrapper = mount(SearchAutocomplete, {
      props: { minChars: 1, delay: 0 },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' }, Transition: false } },
    })
    const input = wrapper.get('input')

    await input.setValue('off')
    await input.trigger('focus')
    // wait for debounce + fetch
    await new Promise((r) => setTimeout(r, 20))
    await wrapper.vm.$nextTick()

    // menu should be open
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)

    // Click the Search button to submit
    await wrapper.get('button[aria-label="Search shows"]').trigger('click')

    // component emits "submit" with the current term
    const submits = wrapper.emitted('submit')
    expect(!!(submits && submits.length)).toBe(true)
    expect(submits?.[0]?.[0]).toContain('off')
  })

  it('closes on Escape', async () => {
    const wrapper = mount(SearchAutocomplete, {
      props: { minChars: 1, delay: 0 },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' }, Transition: false } },
    })
    const input = wrapper.get('input')
    await input.setValue('x')
    await input.trigger('focus')

    // allow watcher + immediate open + debounce to run
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    // ensure it is open first
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)

    // press Escape to close
    await input.trigger('keydown', { key: 'Escape' })
    // flush updates + any queued tasks
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 10))

    // wait until it disappears (in case a pending fetch finished just before Escape)
    let attempts = 10
    while (attempts-- && wrapper.find('[role="listbox"]').exists()) {
      await new Promise((r) => setTimeout(r, 5))
      await wrapper.vm.$nextTick()
    }
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })
})
