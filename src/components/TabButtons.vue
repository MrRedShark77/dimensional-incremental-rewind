<script setup lang="ts">
import { setTab, TAB_COMPONENTS, TAB_ORDER, TABS } from '@/data/tabs';
import PrimaryButton from './PrimaryButton.vue';
import { player, temp } from '@/main';
import { computed } from 'vue';

const STAB = computed(() => TABS[player.tab].stabs)
</script>

<template>
  <div class="table-center" style="margin: 5px;">
    <div v-for="x in TAB_ORDER" :key="x">
      <PrimaryButton class="tab-button" :class="{...TABS[x].class, notified: temp.tab_notifications[TABS[x].prestab!] || TABS[x].stabs.some(([y]) => temp.tab_notifications[y])}" v-if="TABS[x].condition?.() ?? true" :style="TABS[x].style" @click="setTab(x)">{{ TABS[x].name }}</PrimaryButton>
    </div>
  </div>
  <component :is="TAB_COMPONENTS[TABS[player.tab].prestab!]?.component" />
  <div class="table-center" v-if="STAB.length > 1" style="min-height: 60px; margin: 5px;">
    <div v-for="x in STAB.length" :key="x-1">
      <PrimaryButton class="stab-button" :class="{notified: temp.tab_notifications[STAB[x-1][0]]}" v-if="STAB[x-1][1]?.() ?? true" @click="setTab(x-1,true)">{{ TAB_COMPONENTS[STAB[x-1][0]].name }}</PrimaryButton>
    </div>
  </div>
</template>

<style scoped>
.tab-button {
  font-size: 20px;
  padding-left: 14px;
  padding-right: 14px;
}
.stab-button {
  width: 200px;
  padding-left: 14px;
  padding-right: 14px;
}
.tab-button.notified, .stab-button.notified {
  padding-left: 8px;
  padding-right: 20px;
}
.notified::after {
  position: absolute;
  top: 50%;
  right: 0px;
  transform: translateY(-50%);

  color: white;
  font-weight: bold;
  width: 12px;
  font-size: 18px;
  height: 100%;
  background: red;
  display: flex;
  justify-content: center;
  align-items: center;

  content: "!";
}
</style>
