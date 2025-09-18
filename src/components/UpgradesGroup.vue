<script setup lang="ts">
import { UpgradeGroups } from '@/data/upgrades';
import UpgradeButton from './UpgradeButton.vue';

const { id } = defineProps<{ id: string }>()
</script>

<template>
  <div class="o-upgrades">
    <UpgradeButton v-for="x in UpgradeGroups[id]" :key="x" :id="x" />
  </div>
</template>

<style scoped>
.o-upgrades {
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(6, 200px);
  grid-auto-rows: minmax(200px, auto);
  gap: 2px;
}
</style>
