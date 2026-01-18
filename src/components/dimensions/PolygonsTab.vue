<script setup lang="ts">
import { Currency, formatCurrencyGain } from '@/data/currencies';
import { player, temp } from '@/main';
import { format } from '@/utils/formats';
import UpgradesGroup from '../UpgradesGroup.vue';

</script>

<template>
  <div>
    <div>You have <h4>{{ format(player.polygons, 0) }} / {{ format(temp.polygons_cap, 0) }}</h4> {{ formatCurrencyGain(Currency.Polygons) }} Polygons, which raise points gain by <h4>{{ format(temp.polygons_effect,4) }}</h4> to the exponent.</div>
    <div>Polygons cap formula: <b>({{ format(temp.polygons_mult) }}*(lg(Line Segments)/4756)<sup>{{ format(temp.polygons_exp[0]) }}</sup>Shapes<sup>{{ format(temp.polygons_exp[1]) }}</sup>)<sup>{{ format(temp.polygons_exp[2],4) }}</sup></b>.</div>
  </div>
  <UpgradesGroup :id="'polygon'" />
</template>
