import { player, temp } from '@/main'
import { formatGain } from '@/utils/formats'
import type { DecimalSource } from 'break_eternity.js'
import Decimal from 'break_eternity.js'
import { Dimension, Dimensions, Strings } from './dimensions'
import { isMilestoneAchieved } from './milestones'
import { getUpgradeEffect } from './upgrades'

export enum Currency {
  Points = 'points',
  Dots = 'dots',
  Lines = 'lines',
  Shapes = 'shapes',

  LineSegments = 'line-segments',
  Strings = 'strings',
}

export const Currencies: Record<
  Currency,
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
      let x = Decimal.mul(temp.dimension_effects[0], temp.dimension_effects[1])
      x = x.pow(temp.line_segments_effect).pow(getUpgradeEffect('dots\\17')).pow(getUpgradeEffect('line-seg\\11'))
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
}

export function formatCurrencyGain(id: Currency) {
  const C = Currencies[id]
  return formatGain(C.amount, Decimal.mul(C.gain, C.passive))
}
