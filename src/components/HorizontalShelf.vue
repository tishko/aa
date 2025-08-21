<template>
  <section class="card shelf-card">
    <div class="shelf-head">
      <h2 class="shelf-title">{{ title }}</h2>
      <div class="shelf-cta">({{ shows.length }}) Top rated by genre</div>
    </div>

    <div class="shelf-wrap">
      <button v-show="canLeft" class="carousel-nav left" aria-label="Scroll left" @click="prev">
        ‹
      </button>
      <button v-show="canRight" class="carousel-nav right" aria-label="Scroll right" @click="next">
        ›
      </button>

      <div class="carousel-fade left" :class="{ 'is-off': !canLeft }" aria-hidden="true" />
      <div class="carousel-fade right" :class="{ 'is-off': !canRight }" aria-hidden="true" />

      <div ref="emblaRef" class="embla" role="region" :aria-label="`${title} shows`" tabindex="0">
        <div class="embla__container">
          <ShowCard v-for="show in shows" :key="show.id" :show="show" class="embla__slide" />
          <RefreshButton
            v-if="hasMore"
            class="embla__slide refresh"
            :loading="loading"
            @click="onClick"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { MIN_WAITING_TIME_MS } from '@/common/constants'
import { useShows } from '@/composables/useShows'
import type { Show } from '@/services/tvmaze'

import RefreshButton from './RefreshButton.vue'
import ShowCard from './ShowCard.vue'

interface Props {
  title: string
  shows: Show[]
}
defineProps<Props>()

const { hasMore, loading, loadMore } = useShows()

const onClick = async () => {
  const time = performance.now()
  while (performance.now() - time < MIN_WAITING_TIME_MS) await loadMore(5)
}

const [emblaRef, emblaApi] = emblaCarouselVue({ dragFree: true })

const canLeft = ref(false)
const canRight = ref(false)

function updateArrows() {
  const api = emblaApi.value
  if (!api) return
  canLeft.value = api.canScrollPrev()
  canRight.value = api.canScrollNext()
}

onMounted(() => {
  const api = emblaApi.value
  if (!api) return
  updateArrows()
  api.on('select', updateArrows)
  api.on('reInit', updateArrows)
})

onBeforeUnmount(() => {
  emblaApi.value?.off('select', updateArrows)
  emblaApi.value?.off('reInit', updateArrows)
})

function prev() {
  emblaApi.value?.scrollPrev()
}
function next() {
  emblaApi.value?.scrollNext()
}
</script>

<style scoped>
.shelf-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.shelf-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}
.shelf-cta {
  color: var(--muted);
  font-size: 12px;
}
.shelf-wrap {
  position: relative;
}
.refresh {
  width: 180px;
  height: 100%;
}
</style>
