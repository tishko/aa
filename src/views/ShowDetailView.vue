<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getShow, type ShowDetail } from '@/services/tvmaze'
import { sanitize } from '@/utils/sanitize'

const route = useRoute()
const show = ref<ShowDetail | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function loadById(id: number) {
  try {
    loading.value = true
    show.value = await getShow(id)
  } catch (err: any) {
    error.value = err?.message ?? 'Failed to load show'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const id = Number(route.params.id)
  await loadById(id)
})

watch(
  () => route.params.id,
  async (next, prev) => {
    if (next === prev) return
    const id = Number(next)
    show.value = null
    error.value = null
    await loadById(id)
  },
)
</script>

<template>
  <main class="container">
    <section v-if="loading" class="card card-pad card--state" aria-busy="true">Loading…</section>
    <section v-else-if="error" class="card card-pad card--state error" role="alert">
      {{ error }}
    </section>

    <section v-else-if="show" class="card card-pad">
      <div class="hero">
        <figure class="poster-big">
          <img
            v-if="show.image?.original || show.image?.medium"
            :src="show.image.original || show.image.medium"
            :alt="`Poster of ${show.name}`"
            decoding="async"
          />
          <div v-else class="poster-big--placeholder" aria-hidden="true">🎬</div>
        </figure>

        <div class="info">
          <h1 class="title">{{ show.name }}</h1>

          <div class="chips">
            <span class="badge" aria-label="Average rating">
              <strong aria-hidden="true">★</strong>
              {{ show.rating?.average ?? '—' }}
            </span>
            <span v-for="genre in show.genres" :key="genre" class="pill">{{ genre }}</span>
          </div>

          <p class="muted">
            <span v-if="show.premiered">Premiered: {{ show.premiered }}</span>
            <span v-if="show.ended"> • Ended: {{ show.ended }}</span>
            <span> • Status: {{ show.status }}</span>
            <span v-if="show.network"> • Network: {{ show.network?.name }}</span>
            <span v-else-if="show.webChannel"> • Web: {{ show.webChannel?.name }}</span>
          </p>

          <div v-if="show.summary" class="summary" aria-label="Summary">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="sanitize(show.summary)" />
          </div>

          <div class="actions">
            <a
              v-if="show.officialSite"
              :href="show.officialSite"
              target="_blank"
              rel="noreferrer"
              class="btn"
              aria-label="Open official site (opens in a new tab)"
            >
              Official site
            </a>
          </div>
        </div>
      </div>

      <div v-if="show._embedded?.cast?.length" class="section">
        <h2 class="section-title">Cast</h2>
        <div class="row wrap">
          <span
            v-for="{ person, character } in show._embedded.cast"
            :key="person.name + character.name"
            class="pill"
          >
            {{ person.name }} as {{ character.name }}
          </span>
        </div>
      </div>

      <div v-if="show._embedded?.episodes?.length" class="section">
        <h2 class="section-title">Episodes</h2>
        <div class="row wrap">
          <span
            v-for="{ id, name, season, number } in show._embedded.episodes"
            :key="id"
            class="pill"
          >
            S{{ season }}E{{ number }} — {{ name }}
          </span>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.card--state {
  color: var(--muted);
}

.hero {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 840px) {
  .hero {
    grid-template-columns: 1fr;
  }
}

.info {
  min-width: 260px;
}
.title {
  margin: 0 0 6px 0;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.2px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.muted {
  color: var(--muted);
  margin: 4px 0 10px 0;
}

.summary :deep(p) {
  margin: 0 0 10px;
  line-height: 1.65;
  color: var(--text);
}
.summary :deep(a) {
  color: var(--focus-ring);
  text-decoration: underline;
}
.summary :deep(em),
.summary :deep(i) {
  color: var(--muted);
}

.actions {
  margin-top: 12px;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--btn-secondary-bg);
  border: 1px solid var(--btn-secondary-border);
  color: var(--btn-secondary-text);
  text-decoration: none;
  font-weight: 700;
}
.btn:hover {
  filter: brightness(1.05);
}

.section {
  margin-top: 18px;
}
.section-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 800;
}
.row.wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.poster-big {
  position: relative;
  width: 260px;
  height: 360px;
  border-radius: var(--radius-12);
  overflow: hidden;
  background: var(--overlay);
  border: 1px solid var(--border);
  display: grid;
  place-items: center;
}
.poster-big img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.poster-big--placeholder {
  opacity: 0.6;
  font-size: 36px;
}
@media (max-width: 840px) {
  .poster-big {
    width: 200px;
    height: 280px;
  }
}
.badge strong {
  font-size: 16px;
}
</style>
