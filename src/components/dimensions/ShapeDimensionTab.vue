<script setup lang="ts">
import { player, temp } from '@/main'
import { format, formatMult } from '@/utils/formats'
import ResetButton from '../ResetButton.vue'
</script>

<template>
  <div>
    You have
    <h4>{{ format(player.dimensions[2], 0) }}</h4>
    Shapes, which [REDACTED] by
    <h4>{{ formatMult(temp.dimension_effects[2]) }}</h4>
    .
  </div>
  <ResetButton :id="'shapes'"/>
</template>
