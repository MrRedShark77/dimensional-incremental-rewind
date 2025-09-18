<script setup lang="ts">
import TabButtons from './components/TabButtons.vue'
import { Currency, formatCurrencyGain } from './data/currencies'
import { TAB_COMPONENTS, TABS } from './data/tabs'
import { load, player } from './main'
import { format } from './utils/formats'

load()
</script>

<template>
  <div>
    You have
    <h3>{{ format(player.points, 0) }}</h3>
    {{ formatCurrencyGain(Currency.Points) }} points.
  </div>
  <hr class="line" />
  <TabButtons />
  <component :is="TAB_COMPONENTS[TABS[player.tab].stabs[player.stab[player.tab]][0]].component" />
</template>

<style scoped></style>
