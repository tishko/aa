<template>
  <div ref="containerRef" class="ac-wrap">
    <div class="ac-row">
      <input
        v-model="model"
        class="input ac-input"
        placeholder="Search TV shows by name"
        aria-label="Search TV shows by name"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="isOpen"
        :aria-controls="isOpen ? 'ac-list' : undefined"
        @focus="onFocus"
        @keydown="onKeydown"
      />
      <button class="btn" aria-label="Search shows" @click="submit">Search</button>
    </div>

    <Transition name="fade-scale">
      <div v-if="isOpen" id="ac-list" class="ac-pop" role="listbox" :aria-busy="isLoading">
        <div v-if="isLoading" class="ac-empty">Searching</div>
        <template v-else>
          <RouterLink
            v-for="show in items"
            :key="show.id"
            :to="{ name: 'show', params: { id: show.id } }"
            class="ac-item"
            role="option"
          >
            <div class="ac-thumb">
              <img
                v-if="show.image?.medium"
                :src="show.image.medium"
                :alt="show.name"
                loading="lazy"
                decoding="async"
              />
              <div v-else class="ac-thumb--placeholder" aria-hidden>🎬</div>
            </div>

            <div class="ac-meta">
              <div class="ac-title">{{ show.name }}</div>
              <div class="ac-sub">
                {{ show.genres?.length ? show.genres.slice(0, 2).join(', ') : '-' }}
              </div>
            </div>

            <div class="rating-pill" aria-label="Rating">
              <span class="star" aria-hidden>★</span>
              <span>{{ show.rating?.average ?? '-' }}</span>
            </div>
          </RouterLink>

          <RouterLink
            v-if="items.length"
            class="ac-item ac-footer"
            :to="{ name: 'search', query: { q: term } }"
            :aria-label="`See all results for ${term}`"
            @click="isOpen = false"
          >
            <div class="ac-footer-text">
              See all results for "<strong>{{ term }}</strong
              >"
            </div>
          </RouterLink>
          <div v-else class="ac-empty">No matches.</div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import debounce from 'lodash.debounce'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { searchShows, type Show } from '@/services/tvmaze'

interface Props {
  minChars?: number
  maxItems?: number
  delay?: number
}
const props = withDefaults(defineProps<Props>(), {
  minChars: 2,
  maxItems: 8,
  delay: 300,
})
const model = defineModel<string>()
const emit = defineEmits<{
  (event: 'submit', value: string): void // eslint-disable-line no-unused-vars
}>()

const containerRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const isLoading = ref(false)
const items = ref<Show[]>([])
const searchCounter = ref(0)

const term = computed(() => model.value?.trim() ?? '')

const onDebouncedSearch = debounce(query, props.delay)

watch(term, () => {
  if (term.value.length < props.minChars) {
    reset()
    return
  }

  isOpen.value = true
  isLoading.value = true
  onDebouncedSearch(term.value)
})

function reset() {
  ++searchCounter.value
  onDebouncedSearch.cancel()
  isOpen.value = false
  isLoading.value = false
  items.value = []
}

function onFocus() {
  if (term.value.length >= props.minChars) {
    isOpen.value = true
    query(term.value)
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    if (!isOpen.value || items.value.length === 0) {
      submit()
      return
    }
    event.preventDefault()
    return
  }

  if (event.key === 'Escape') reset()
}

async function query(q: string) {
  const currentSearchNumber = ++searchCounter.value
  try {
    isLoading.value = true
    const result = await searchShows(q)
    if (currentSearchNumber !== searchCounter.value) return
    items.value = result.slice(0, props.maxItems)
    isOpen.value = true
  } finally {
    if (currentSearchNumber === searchCounter.value) isLoading.value = false
  }
}

function submit() {
  if (term.value.length < props.minChars) return

  reset()
  emit('submit', term.value)
}

function onOutsideClick({ target }: MouseEvent) {
  if (!containerRef.value?.contains(target as Node)) reset()
}
onMounted(() => document.addEventListener('click', onOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', onOutsideClick))
</script>

<style scoped>
.ac-wrap {
  position: relative;
}
.ac-row {
  display: flex;
  gap: 10px;
  align-items: stretch;
}
.ac-input {
  font-size: 15px;
}

.ac-pop {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 10px);
  z-index: 60;
  background: var(--popover);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 16px 50px rgb(var(--black-rgb) / 0.55);
  padding: 8px;
  max-height: 420px;
  overflow: auto;
}

.ac-item {
  display: grid;
  grid-template-columns: 46px 1fr auto;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 9px 10px;
  border-radius: 12px;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  transition:
    background 0.15s ease,
    transform 0.06s ease;
}
.ac-item + .ac-item {
  margin-top: 6px;
}
.ac-item:hover {
  background: linear-gradient(
    0deg,
    rgb(var(--accent-2-rgb) / 0.1),
    rgb(var(--accent-2-rgb) / 0) 40%
  );
}
.ac-item:active {
  transform: scale(0.997);
}

.ac-item[aria-selected='true'] {
  background: linear-gradient(
    0deg,
    rgb(var(--accent-2-rgb) / 0.1),
    rgb(var(--accent-2-rgb) / 0) 40%
  );
  outline: 2px solid var(--accent-2);
  outline-offset: 2px;
}

.ac-thumb {
  width: 46px;
  height: 66px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--overlay);
  border: 1px solid var(--border);
  display: grid;
  place-items: center;
}
.ac-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ac-thumb--placeholder {
  font-size: 18px;
  opacity: 0.75;
}

.ac-meta {
  min-width: 0;
}
.ac-title {
  color: var(--text);
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ac-title :deep(mark) {
  background: transparent;
  color: var(--accent-2);
  font-weight: 900;
  text-shadow: 0 0 6px rgb(var(--accent-2-rgb) / 0.35);
}
.ac-sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}

.ac-rating:hover {
  background: rgb(var(--accent-2-rgb) / 0.25);
  border-color: rgb(var(--accent-2-rgb) / 0.6);
}

.ac-footer {
  grid-template-columns: 1fr auto;
  padding-inline: var(--space-3);
}
.ac-footer .ac-footer-text {
  color: var(--text);
  opacity: 0.95;
}

.ac-empty {
  padding: 10px;
  color: var(--muted);
  text-align: center;
}
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.12s ease;
}
.fade-scale-enter-from {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.ac-pop::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}
.ac-pop::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 10px;
}
</style>
