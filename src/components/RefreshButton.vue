<template>
  <button
    class="refresh-btn"
    :aria-busy="loading"
    :disabled="isDisabled"
    aria-label="Refresh"
    @click="$emit('click')"
  >
    <svg class="icon" viewBox="0 0 24 24" role="img" aria-hidden="true" :class="{ spin: loading }">
      <path
        d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L14 10h8V2l-4.35 4.35z"
        fill="currentColor"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    loading?: boolean

    disabled?: boolean
  }>(),
  {
    loading: false,
    disabled: false,
  },
)

defineEmits<{
  (event: 'click'): void // eslint-disable-line no-unused-vars
}>()

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<style scoped>
.refresh-btn {
  color: var(--btn-secondary-text);
  background: var(--panel-2);
  border: none;
}
.refresh-btn:hover:not(:disabled) {
  filter: brightness(1.07);
  transform: translateY(-1px);
}
.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.icon {
  width: 70%;
  height: auto;
}
.spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
