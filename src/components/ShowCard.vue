<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import type { Show } from '@/services/tvmaze'

interface Props {
  show: Show
}
const props = defineProps<Props>()

const poster = computed(() => props.show.image?.medium || props.show.image?.original || '')
</script>

<template>
  <RouterLink
    class="card show-card"
    :to="{ name: 'show', params: { id: show.id } }"
    :aria-label="`View details for ${show.name}`"
  >
    <div class="poster">
      <img
        v-if="poster"
        :src="poster"
        :alt="`Poster of ${show.name}`"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="poster--placeholder" aria-hidden="true">🎬</div>
    </div>

    <div class="meta">
      <h3 class="title">{{ show.name }}</h3>

      <div class="rating-pill" aria-label="Average rating">
        <span class="star" aria-hidden="true">★</span>
        <span>{{ show.rating?.average ?? '-' }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.show-card {
  width: 180px;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease;
}
.show-card:hover,
.show-card:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgb(var(--black-rgb) / 0.55);
  outline: none;
}
.meta {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
}

.poster {
  position: relative;
  width: 180px;
  height: 270px;
  border-radius: var(--radius-12);
  overflow: hidden;
  background: var(--overlay);
  border: 1px solid var(--border);
  display: grid;
  place-items: center;
}
.poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.poster--placeholder {
  opacity: 0.6;
  font-size: 28px;
}
</style>
