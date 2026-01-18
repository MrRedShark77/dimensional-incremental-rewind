<script setup lang="ts">
import { MilestoneGroups, Milestones } from '@/data/milestones';
import { player } from '@/main';

const { id } = defineProps<{ id: string }>()
</script>

<template>
  <table align="center">
    <template v-for="x in MilestoneGroups[id]" :key="x">
      <tr v-if="player.milestones[x] || (player.milestones[Milestones[x].previous!] ?? true)" class="o-milestone-tab-row" :class="{'o-milestone--achieved': player.milestones[x]}">
        <td v-html="Milestones[x].title"></td>
        <td v-html="Milestones[x].description"></td>
      </tr>
    </template>
  </table>
</template>
