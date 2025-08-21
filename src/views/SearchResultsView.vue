<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import ShowCard from '@/components/ShowCard.vue'
import { searchShows, type Show } from '@/services/tvmaze'

const route = useRoute()
const term = computed(() => String(route.query.q ?? '').trim())

const loading = ref(false)
const error = ref<string | null>(null)
const items = ref<Show[]>([])

const ratedOnly = ref(false)
const minRating = ref(0)

const filtered = computed(() => {
  if (minRating.value > 0) {
    return items.value.filter(({ rating }) => (rating?.average ?? 0) >= minRating.value)
  }
  if (ratedOnly.value) {
    return items.value.filter(({ rating }) => typeof rating?.average === 'number')
  }
  return items.value
})

async function runForRouteQuery() {
  if (!term.value) {
    items.value = []
    return
  }

  try {
    loading.value = true
    error.value = null
    items.value = await searchShows(term.value)
  } catch (err: any) {
    error.value = err?.message ?? 'Search failed'
  } finally {
    loading.value = false
  }
}

watch(term, runForRouteQuery, { immediate: true })
</script>

<template>
  <main class="container stack">
    <section class="card card-pad">
      <div class="toolbar">
        <div class="toolbar-left">
          <template v-if="term">Results for “{{ term }}” — {{ filtered.length }} found</template>
        </div>

        <div class="toolbar-right">
          <label class="chip">
            <input v-model="ratedOnly" type="checkbox" />
            <span>Rated only</span>
          </label>
          <label class="chip">
            <span class="range-label">Min ★ {{ minRating }}</span>
            <input v-model.number="minRating" type="range" min="0" max="10" step="0.5" />
          </label>
        </div>
      </div>
    </section>

    <section v-if="error" class="card card-pad error-text">
      {{ error }}
    </section>

    <section class="card card-pad">
      <div v-if="loading">Loading…</div>
      <div v-else class="grid">
        <ShowCard v-for="s in filtered" :key="s.id" :show="s" />
      </div>
      <div v-if="!loading && term && filtered.length === 0" class="muted">
        No results match your filters.
      </div>
    </section>
  </main>
</template>

<style scoped>
.range-label {
  min-width: 72px;
  display: inline-block;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.toolbar-left {
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 280px;
}
.toolbar-right {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.chip input[type='range'] {
  width: 140px;
}
</style>
