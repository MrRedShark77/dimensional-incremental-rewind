<script setup lang="ts">
import { player } from '@/main';
import { format } from '@/utils/formats';
import PrimaryButton from '../PrimaryButton.vue';
import { FabricCostRequirements, getFabrics, respecShapeTree, ShapeTreeDepth } from '@/data/shape_tree';
import { Currencies } from '@/data/currencies';
import Decimal from 'break_eternity.js';
import ShapeTreeUpgrade from './ShapeTreeUpgrade.vue';
</script>

<template>
  <PrimaryButton @click="respecShapeTree()">Respec Shape Tree</PrimaryButton>
  <div>
    <div v-for="(t,i) in ShapeTreeDepth" class="table-center" :key="i">
      <ShapeTreeUpgrade v-for="j in t" :key="j" :id="j" />
    </div>
  </div>
  <div class="bottom-div">
    <div>You have {{ format(Currencies.fabrics.amount,0) }} Fabrics.</div>
    <div class="fabric-buttons">
      <PrimaryButton v-for="(v,i) in FabricCostRequirements" :key="i"
      :enabled="Decimal.gte(Currencies[v.currency].amount, v.require(player.total_fabrics[i]))"
      @click="getFabrics(i)">
        Require <b>{{ format(v.require(player.total_fabrics[i]),0) }}</b> {{ Currencies[v.currency].name }}
      </PrimaryButton>
    </div>
  </div>
</template>

<style scoped>
.bottom-div {
  position: fixed;
  bottom: 10px;
  width: calc(100% - 20px);
}

.fabric-buttons {
  display: grid;
  grid-template-columns: repeat(3, 200px);
  grid-auto-rows: 50px;
  justify-content: center;
}
</style>
