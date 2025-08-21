<template>
  <main class="container main-stack">
    <section v-if="error" class="card card-pad error-text">
      {{ error }}
    </section>

    <template v-if="loading && topGenres.length === 0">
      <SkeletonShelf v-for="i in 3" :key="i" />
    </template>

    <HorizontalShelf
      v-for="genre in topGenres"
      :key="genre"
      :title="genre"
      :shows="genreBuckets[genre]"
    />
  </main>
</template>

<script setup lang="ts">
defineOptions({ name: 'HomeView' })

import { onMounted } from 'vue'

import HorizontalShelf from '@/components/HorizontalShelf.vue'
import SkeletonShelf from '@/components/SkeletonShelf.vue'
import { useShows } from '@/composables/useShows'

const { loading, error, genreBuckets, topGenres, init } = useShows()

onMounted(() => {
  init()
})
</script>

<style scoped>
.main-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
