import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    {
      path: '/show/:id',
      name: 'show',
      component: () => import('@/views/ShowDetailView.vue'),
      props: true,
    },
    { path: '/search', name: 'search', component: () => import('@/views/SearchResultsView.vue') },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
