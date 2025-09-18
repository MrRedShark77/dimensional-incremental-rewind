<script setup lang="ts">
import { format } from '@/utils/formats';
import ResetButton from '../ResetButton.vue';
import { player, temp } from '@/main';
import UpgradesGroup from '../UpgradesGroup.vue';

</script>

<template>
  <div>You have <h4>{{ format(player.strings, 0) }}pL</h4> of String, which raise Line Segments gain and effect by <h4>{{ format(temp.string_effect, 4) }}</h4>.</div>
  <ResetButton :id="'strings'" />
  <UpgradesGroup :id="'string'" />
</template>
