<script setup lang="ts">
import { format } from '@/utils/formats';
import PrimaryButton from './PrimaryButton.vue';
import { temp } from '@/main';
import { Currencies } from '@/data/currencies';
import { doReset, Resets } from '@/data/resets';
import Decimal from 'break_eternity.js';

const { id } = defineProps<{ id: string }>()

const R = Resets[id], C = Currencies[R.currency], G = Currencies[R.gain];

</script>

<template>
  <PrimaryButton :enabled="Decimal.gte(temp.currencies[R.gain],1)" @click="doReset(id)">
    Reset for <b>{{ format(temp.currencies[R.gain], 0) }}</b> {{ G.name }}
    <br>
    Next at <b>{{ format(C.amount) }} / {{ format(R.next) }}</b> {{ C.name }}
  </PrimaryButton>
</template>
