<template>
  <section class="card pad-14">
    <div class="row spaced mb-8">
      <h2 class="loading-title">Loading…</h2>
      <div class="muted text-12">Fetching shows</div>
    </div>
    <div ref="emblaRef" class="embla">
      <div class="embla__container">
        <div v-for="i in 8" :key="i" class="card shelf-item embla__slide">
          <div class="poster shimmer" />
          <div class="shimmer line"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue'

const [emblaRef] = emblaCarouselVue({ dragFree: true })
</script>

<style scoped>
.pad-14 {
  padding: 14px;
}

.spaced {
  justify-content: space-between;
}
.loading-title {
  margin: 0;
  font-size: 18px;
  opacity: 0.6;
}
.shelf-item {
  padding: 10px;
  width: 180px;
}
.line {
  height: 14px;
  margin-top: 8px;
}

.poster {
  height: 270px;
}
@media (max-width: 640px) {
  .poster {
    height: 210px;
  }
}
</style>
