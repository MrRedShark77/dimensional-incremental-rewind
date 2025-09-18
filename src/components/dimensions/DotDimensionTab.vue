<script setup lang="ts">
import { player, temp } from '@/main'
import { format } from '@/utils/formats'
import ResetButton from '../ResetButton.vue'
import UpgradesGroup from '../UpgradesGroup.vue';
</script>

<template>
  <div>
    You have
    <h4>{{ format(player.dimensions[0], 0) }}</h4>
    Dots, which generates
    <h4>{{ format(temp.dimension_effects[0],0) }}</h4>
    points per second.
  </div>
  <ResetButton :id="'dots'"/>
  <UpgradesGroup :id="'dots'" />
</template>
