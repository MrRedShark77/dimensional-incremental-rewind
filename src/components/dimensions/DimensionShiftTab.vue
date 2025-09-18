<script setup lang="ts">
import { player } from '@/main';
import { format } from '@/utils/formats';
import PrimaryButton from '../PrimaryButton.vue';
import { DimensionShiftRequire, extendDimension } from '@/data/dimensions';
import { computed } from 'vue';
import Decimal from 'break_eternity.js';

const req = computed(() => DimensionShiftRequire[Number(player.dimensionShift)+1])
</script>

<template>
  <div>You have <h4>{{ format(player.dimensionShift,0) }}</h4> Dimensional Shifts.</div>
  <PrimaryButton :enabled="Decimal.gte(player.points,req)" @click="extendDimension()">Unlock a new dimension.<br/>Require <b>{{ format(req) }}</b> points</PrimaryButton>
</template>
