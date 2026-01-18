<script setup lang="ts">
import { player, temp } from '@/main'
import { format, formatPow } from '@/utils/formats'
import ResetButton from '../ResetButton.vue'
</script>

<template>
  <div>
    You have
    <h4>{{ format(player.dimensions[2], 0) }}</h4>
    Shapes, which makes dots boost points by
    <h4>{{ formatPow(temp.dimension_effects[2]) }}</h4>
    .
  </div>
  <ResetButton :id="'shapes'"/>
</template>
