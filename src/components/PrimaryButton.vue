<script setup lang="ts">
import { computed } from 'vue'

// const { enabled = true, bought = false } = defineProps<{ enabled: boolean, bought: boolean }>()

const { enabled, bought } = defineProps({
  enabled: {
    type: Boolean,
    default: true,
  },
  bought: {
    type: Boolean,
    default: false,
  },
})

const classObject = computed(() => {
  return {
    'o-primary-btn--disabled': !bought && !enabled,
    'o-primary-btn--bought': bought,
  }
})
</script>

<template>
  <button class="o-primary-btn" :class="classObject">
    <slot />
  </button>
</template>
