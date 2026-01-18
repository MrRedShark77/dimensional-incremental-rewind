<script setup lang="ts">
import { purchaseShapeTree, ShapeTree } from '@/data/shape_tree';
import PrimaryButton from '../PrimaryButton.vue';
import { player, temp } from '@/main';
import Decimal from 'break_eternity.js';
import { Currencies } from '@/data/currencies';
import { format } from '@/utils/formats';

const { id } = defineProps<{ id: string }>()

const U = ShapeTree[id]
</script>

<template>
  <PrimaryButton v-if="U.condition()" class="o-upgrade" :bought="player.shape_tree[id]" :enabled="Decimal.gte(Currencies.fabrics.amount, U.cost) && (U.require?.every(([x,y]) => Decimal.gte(Currencies[x].amount, y)) ?? true)" @click="purchaseShapeTree(id)">
    <div v-html="U.description"></div>
    <hr class="sub-line">
    <div v-if="'effectDisplay' in U">Effect: <b v-html="U.effectDisplay?.(temp.shape_tree_effect[id])"></b></div>
    <div v-if="'require' in U">Require: {{ U.require?.map(([x,y]) => format(y,0) + " " + Currencies[x].name).join(", ") }}</div>
    <div>Cost: {{ format(U.cost, 0) }} Fabrics</div>
  </PrimaryButton>
</template>

<style scoped>
.o-upgrade {
  width: 240px;
  min-height: 120px;
  font-size: 10px;
}
</style>
