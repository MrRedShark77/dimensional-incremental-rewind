import { player, temp } from '@/main'
import { formatGain } from '@/utils/formats'
import type { DecimalSource } from 'break_eternity.js'
import Decimal from 'break_eternity.js'
import { Dimension, Dimensions, Strings } from './dimensions'
import { isMilestoneAchieved } from './milestones'
import { getUpgradeEffect } from './upgrades'
import { DC, expPow } from '@/utils/decimal'
import { hasShapeTree } from './shape_tree'

export const Currency = {
  Points: 'points',
  Dots: 'dots',
  Lines: 'lines',
  Shapes: 'shapes',

  LineSegments: 'line-segments',
  Strings: 'strings',
  Fabrics: 'fabrics',
  Polygons: 'polygons',
}

export const Currencies: Record<
  string,
  {
    name: string
    amount: DecimalSource
    gain: DecimalSource
    passive: DecimalSource

    [index: string]: unknown
  }
> = {
  points: {
    name: 'Points',

    get amount() {
      return player.points
    },
    set amount(v) {
      player.points = Decimal.max(v, 1)
    },

    get gain() {
      let x = Decimal.mul(temp.dimension_effects[0], temp.dimension_effects[1]).pow(temp.dimension_effects[2])
      x = x.pow(temp.line_segments_effect).pow(getUpgradeEffect('dots\\17')).pow(getUpgradeEffect('line-seg\\11'))
      x = expPow(x, temp.polygons_effect)
      x = expPow(x, getUpgradeEffect('line-seg\\20'))
      x = expPow(x, getUpgradeEffect('polygon\\11'))
      return x
    },

    passive: 1,
  },
  dots: {
    name: 'Dots',

    get amount() {
      return player.dimensions[0]
    },
    set amount(v) {
      player.dimensions[0] = v
    },

    get gain() {
      return Decimal.sub(Dimensions[Dimension.Dot].gain(player.points), this.amount).max(0)
    },

    passive: 0,
  },
  lines: {
    name: 'Lines',

    get amount() {
      return player.dimensions[1]
    },
    set amount(v) {
      player.dimensions[1] = v
    },

    get gain() {
      return Decimal.sub(Dimensions[Dimension.Line].gain(player.dimensions[0]), this.amount).max(0)
    },

    passive: 0,
  },
  shapes: {
    name: 'Shapes',

    get amount() {
      return player.dimensions[2]
    },
    set amount(v) {
      player.dimensions[2] = v
    },

    get gain() {
      return Decimal.sub(Dimensions[Dimension.Shape].gain(player.dimensions[1]), this.amount).max(0)
    },

    passive: 0,
  },
  'line-segments': {
    name: 'Line Segments',

    get amount() {
      return player.line_segments
    },
    set amount(v) {
      player.line_segments = Decimal.mul(temp.currencies[Currency.LineSegments], temp.line_segments_cap).min(v)
    },

    get gain() {
      if (!isMilestoneAchieved('line\\2')) return 0;

      const [ed0,ed1,e] = temp.line_segments_exp

      return Decimal.add(player.dimensions[0], 10).log10().pow(ed0).mul(Decimal.pow(player.dimensions[1], ed1)).mul(temp.line_segments_mult).pow(e)
    },

    passive: 1,
  },
  strings: {
    name: 'pL of String',

    get amount() {
      return player.strings
    },
    set amount(v) {
      player.strings = v
    },

    get gain() {
      return Decimal.sub(Strings.gain(player.line_segments), this.amount).max(0)
    },

    passive: 0,
  },
  fabrics: {
    name: 'fabrics',

    get amount() {
      return Decimal.sub(player.total_fabrics.reduce((a,b) => Decimal.add(a,b), DC.D0), player.spent_fabrics).max(0)
    },

    get gain() {
      return 0
    },

    passive: 0,
  },
  'polygons': {
    name: 'Polygons',

    get amount() {
      return player.polygons
    },
    set amount(v) {
      player.polygons = Decimal.min(temp.polygons_cap, v)
    },

    get gain() {
      if (!isMilestoneAchieved('line\\2')) return 0;

      let x = DC.D1

      x = x.mul(getUpgradeEffect('dots\\29')).mul(getUpgradeEffect('polygon\\1')).mul(getUpgradeEffect('polygon\\5'))
      if (hasShapeTree('4-1')) x = x.mul(10);
      if (isMilestoneAchieved('shape\\3')) x = Decimal.pow10(player.dimensions[2]).mul(x);

      return x
    },

    passive: 1,
  },
}

export function formatCurrencyGain(id: string) {
  const C = Currencies[id]
  return formatGain(C.amount, Decimal.mul(C.gain, C.passive))
}
