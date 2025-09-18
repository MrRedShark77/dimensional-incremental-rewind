import DimensionShiftTab from '@/components/dimensions/DimensionShiftTab.vue'
import DotDimensionTab from '@/components/dimensions/DotDimensionTab.vue'
import LineDimensionTab from '@/components/dimensions/LineDimensionTab.vue'
import LineMilestoneTab from '@/components/dimensions/LineMilestoneTab.vue'
import LineSegmentsTab from '@/components/dimensions/LineSegmentsTab.vue'
import ShapeDimensionTab from '@/components/dimensions/ShapeDimensionTab.vue'
import StringTab from '@/components/dimensions/StringTab.vue'
import OptionsTab from '@/components/OptionsTab.vue'
import { player, temp } from '@/main'
import Decimal from 'break_eternity.js'
import type { Component, StyleValue } from 'vue'
import { isMilestoneAchieved } from './milestones'
import { getUpgradesNotification } from './upgrades'
import { Dimension, Dimensions, DimensionShiftRequire } from './dimensions'

export const TAB_COMPONENTS: Record<string, {
  name: string
  component: Component
  notify?(): boolean
}> = {
  'dimension_shift': {
    name: 'Dimension Shift',
    component: DimensionShiftTab,
    notify() {
      return Decimal.gte(player.points, DimensionShiftRequire[Number(player.dimensionShift)+1])
    },
  },
  'options': {
    name: 'Options',
    component: OptionsTab,
  },

  'dot': {
    name: 'Dot',
    component: DotDimensionTab,
    notify() {
      return !Dimensions[Dimension.Dot].auto && Decimal.gte(temp.currencies['dots'],1) || getUpgradesNotification('dots')
    },
  },

  'line': {
    name: 'Line',
    component: LineDimensionTab,
    notify() {
      return !Dimensions[Dimension.Line].auto && Decimal.gte(temp.currencies['lines'],1)
    },
  },
  'line_milestone': {
    name: 'Line Milestones',
    component: LineMilestoneTab,
  },
  'line_segments': {
    name: 'Line Segments',
    component: LineSegmentsTab,
    notify() {
      return getUpgradesNotification('line-seg')
    },
  },
  'string': {
    name: 'String',
    component: StringTab,
    notify() {
      return !isMilestoneAchieved('line\\12') && Decimal.gte(temp.currencies['strings'],1) || getUpgradesNotification('string')
    },
  },

  'shape': {
    name: 'Shape',
    component: ShapeDimensionTab,
    notify() {
      return !Dimensions[Dimension.Shape].auto && Decimal.gte(temp.currencies['shapes'],1)
    },
  },
}

export const TABS: {
  name: string
  style?: StyleValue
  class?: Record<string, boolean>
  condition?: () => boolean
  stabs: [string, (() => boolean)?][]
  prestab?: string
}[] = [
  {
    name: 'Dimension Shift',

    stabs: [['dimension_shift']],
  },{
    name: 'Options',

    stabs: [['options']],
  },{
    name: 'Dot',
    condition: () => Decimal.gte(player.dimensionShift, 0),

    stabs: [['dot']],
  },{
    name: 'Line',
    condition: () => Decimal.gte(player.dimensionShift, 1),

    prestab: 'line',
    stabs: [
      ['line_milestone'],
      ['line_segments', () => isMilestoneAchieved('line\\2')],
      ['string', () => isMilestoneAchieved('line\\5')],
    ],
  },{
    name: 'Shape',
    condition: () => Decimal.gte(player.dimensionShift, 2),

    stabs: [['shape']],
  },
]

export const TAB_ORDER = [0,2,3,4,1]

export function checkTab() {
  player.stab[player.tab] ??= 0
  player.stab = player.stab.map((x,i) => Math.min(x, TABS[i].stabs.length-1))
}

export function setTab(i: number, stab: boolean = false) {
  if (stab) player.stab[player.tab] = i
  else player.tab = i

  checkTab()
}

export function updateTabNotifications() {
  for (const id in TAB_COMPONENTS) temp.tab_notifications[id] = TAB_COMPONENTS[id].notify?.() ?? false;
}
