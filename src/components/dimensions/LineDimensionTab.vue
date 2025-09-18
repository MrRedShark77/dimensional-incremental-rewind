<script setup lang="ts">
import { player, temp } from '@/main'
import { format, formatMult } from '@/utils/formats'
import ResetButton from '../ResetButton.vue'
</script>

<template>
  <div>
    You have
    <h4>{{ format(player.dimensions[1], 0) }}</h4>
    Lines, which makes points boost themselves by
    <h4>{{ formatMult(temp.dimension_effects[1]) }}</h4>
    .
  </div>
  <ResetButton :id="'lines'"/>
</template>
