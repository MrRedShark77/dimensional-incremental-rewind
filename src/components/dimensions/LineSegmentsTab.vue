<script setup lang="ts">
import { Currency, formatCurrencyGain } from '@/data/currencies';
import { player, temp } from '@/main';
import { format } from '@/utils/formats';
import UpgradesGroup from '../UpgradesGroup.vue';

</script>

<template>
  <div>
    <div>You have <h4>{{ format(player.line_segments, 0) }}</h4> {{ formatCurrencyGain(Currency.LineSegments) }} Line Segments, which raise points gain by <h4>{{ format(temp.line_segments_effect,4) }}</h4>.</div>
    <div>Line Segments gain formula: <b>({{ format(temp.line_segments_mult) }}*lg(Dots)<sup>{{ format(temp.line_segments_exp[0]) }}</sup>Lines<sup>{{ format(temp.line_segments_exp[1]) }}</sup>)<sup>{{ format(temp.line_segments_exp[2],4) }}</sup></b>.</div>
    <div>Line Segments cap at <b>{{ format(temp.line_segments_cap, 0) }}</b> seconds worth of production.</div>
  </div>
  <UpgradesGroup :id="'line-seg'" />
</template>
