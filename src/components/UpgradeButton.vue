<script setup lang="ts">
import { getUpgradeCosts, purchaseUpgrade, Upgrades } from '@/data/upgrades';
import PrimaryButton from './PrimaryButton.vue';
import { computed } from 'vue';
import { player, temp } from '@/main';
import { Currencies } from '@/data/currencies';
import { format } from '@/utils/formats';
import Decimal from 'break_eternity.js';
const { id } = defineProps<{ id: string }>()

const U = Upgrades[id]

const costs = computed(() => getUpgradeCosts(id))
</script>

<template>
  <PrimaryButton v-if="player.discovered_upgrades[id] || (U.condition?.() ?? true)" class="o-upgrade" :bought="!U.repeatable && Decimal.gte(player.upgrades[id], 1)" :enabled="U.cost.every(([x],i) => Decimal.gte(Currencies[x].amount, costs[i]))" @click="purchaseUpgrade(id)">
    <div v-if="U.repeatable">
      Level {{ format(player.upgrades[id], 0) }}
      <hr class="sub-line">
    </div>
    <div v-html="U.description"></div>
    <hr class="sub-line">
    <div v-if="'effectDisplay' in U">Effect: <b v-html="U.effectDisplay?.(temp.upgrades[id])"></b></div>
    <div>Cost: {{ U.cost.map(([x],i) => format(costs[i],0) + " " + Currencies[x].name).join(", ") }}</div>
  </PrimaryButton>
</template>

<style scoped>
.o-upgrade {
  font-size: 10px;
}
</style>
