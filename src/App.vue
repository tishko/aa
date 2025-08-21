<template>
  <header class="container header-bar">
    <div class="row header-inner">
      <RouterLink to="/" class="row brand">
        <div class="brand-badge">TV</div>
        <strong class="brand-title">dashboard</strong>
      </RouterLink>

      <div class="row wrap actions">
        <div class="search-wrap">
          <SearchAutocomplete
            v-model="searchQuery"
            :min-chars="2"
            :max-items="8"
            :delay="300"
            @submit="onSubmit"
          />
        </div>
      </div>
    </div>
  </header>

  <RouterView v-slot="{ Component }">
    <KeepAlive include="HomeView">
      <component :is="Component" />
    </KeepAlive>
  </RouterView>

  <footer class="container footer-note">Made for AA</footer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import SearchAutocomplete from '@/components/SearchAutocomplete.vue'

const route = useRoute()
const router = useRouter()
const searchQuery = ref(String(route.query.q ?? ''))

watch(
  () => route.fullPath,
  () => {
    searchQuery.value = String(route.query.q ?? '')
  },
)

function onSubmit(q: string) {
  router.push({ name: 'search', query: { q } })
}
</script>

<style scoped>
.header-bar {
  padding-top: 20px;
  padding-bottom: 10px;
}

.header-inner {
  justify-content: space-between;
  gap: 12px;
}
@media (max-width: 500px) {
  .header-inner {
    flex-direction: column;
  }
}

.brand {
  gap: 10px;
}

.brand-badge {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--focus-ring), var(--accent-2) 80%);
  display: grid;
  place-items: center;
  font-weight: 800;
}

.brand-title {
  font-size: 18px;
}

.actions {
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
}

.search-wrap {
  min-width: 320px;
  max-width: 560px;
  flex: 1;
}

.footer-note {
  padding: 24px 16px;
  color: var(--muted);
  font-size: 12px;
}
</style>
