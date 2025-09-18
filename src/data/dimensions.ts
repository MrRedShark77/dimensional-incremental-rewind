import { player, temp } from '@/main'
import { D, DC, expPow, scale } from '@/utils/decimal'
import type { DecimalSource } from 'break_eternity.js'
import Decimal from 'break_eternity.js'
import { getUpgradeEffect, hasUpgrade } from './upgrades'
import { isMilestoneAchieved } from './milestones'

export enum Dimension {
  Dot = 0,
  Line,
  Shape,
  Form,
}

export const DimensionShiftRequire: Record<number | string, DecimalSource> = {
  0: 1,
  1: DC.DE308,
  2: D('e8.2756e491'),
  3: DC.DINF,
}

export function extendDimension() {
  if (Decimal.gte(player.points, DimensionShiftRequire[Number(player.dimensionShift)+1])) player.dimensionShift = Decimal.add(player.dimensionShift, 1);
}

export const Dimensions = [
  {
    get mult(): DecimalSource {
      let x = DC.D1

      x = x.mul(getUpgradeEffect('dots\\3')).mul(getUpgradeEffect('dots\\14'))
      .mul(getUpgradeEffect('line-seg\\7')).mul(getUpgradeEffect('line-seg\\9')).mul(getUpgradeEffect('line-seg\\17'))
      .mul(getUpgradeEffect('string\\8')).mul(getUpgradeEffect('string\\11'))

      return x
    },
    get bulk() {
      return isMilestoneAchieved('line\\3') || hasUpgrade('dots\\5')
    },
    get auto() {
      return isMilestoneAchieved('line\\4')
    },
    currency: 'dots',

    next(x: DecimalSource) {
      if (!this.bulk) x = Decimal.min(x, player.dimensions[0]);

      let y = scale(x, ...temp.dot_softcap1, 'P')

      y = y.div(this.mult).pow(2).pow_base(2)

      return y
    },

    gain(x: DecimalSource) {
      if (Decimal.lt(x, 1)) return 0

      let y = Decimal.max(x, 1).log(2).root(2).mul(this.mult)

      y = scale(y, ...temp.dot_softcap1, 'P', true)

      if (!this.bulk) y = y.min(player.dimensions[0]);

      return y.floor().add(1)
    },

    effect() {
      let x = D(player.dimensions[0])

      x = x.mul(getUpgradeEffect('dots\\1')).mul(getUpgradeEffect('dots\\2'))

      x = expPow(x, getUpgradeEffect('dots\\5'))

      return x
    },
  },
  {
    get mult(): DecimalSource {
      let x = DC.D1

      x = x.mul(getUpgradeEffect('string\\1')).mul(getUpgradeEffect('dots\\26'))

      return x
    },
    get bulk() {
      return hasUpgrade('string\\12')
    },
    get auto() {
      return false
    },
    currency: 'lines',

    next(x: DecimalSource) {
      if (!this.bulk) x = Decimal.min(x, player.dimensions[1]);

      let y = Decimal.div(x, this.mult)

      y = y.pow(1.5).pow_base(4).mul(64)

      return y
    },

    gain(x: DecimalSource) {
      if (Decimal.lt(x, 64)) return 0

      let y = Decimal.div(x, 64).max(1).log(4).root(1.5)

      y = y.mul(this.mult)

      if (!this.bulk) y = y.min(player.dimensions[1]);

      return y.floor().add(1)
    },

    effect() {
      let x = expPow(Decimal.add(1, player.points), 0.5).min('ee3');

      x = x.mul(getUpgradeEffect('line-seg\\3'))
      x = x.pow(player.dimensions[1]).pow(getUpgradeEffect('dots\\8')).pow(getUpgradeEffect('dots\\10'))
      x = expPow(x, getUpgradeEffect('dots\\15'))

      return x
    },
  },{
    get mult(): DecimalSource {
      return DC.D1
    },
    get bulk() {
      return false
    },
    get auto() {
      return false
    },
    currency: 'shapes',

    next(x: DecimalSource) {
      if (!this.bulk) x = Decimal.min(x, player.dimensions[2]);

      let y = Decimal.div(x, this.mult)

      y = y.pow(1.5).pow_base(10).mul(100)

      return y
    },

    gain(x: DecimalSource) {
      if (Decimal.lt(x, 100)) return 0

      let y = Decimal.div(x, 100).max(1).log(10).root(1.5)

      y = y.mul(this.mult)

      if (!this.bulk) y = y.min(player.dimensions[2]);

      return y.floor().add(1)
    },

    effect() {
      let x = DC.D1

      x = x

      return x
    },
  },
]

export const LineSegments = {
  get multiplier(): DecimalSource {
    let x = DC.D1

    x = x.mul(getUpgradeEffect('line-seg\\4')).mul(getUpgradeEffect('line-seg\\5'))

    if (hasUpgrade('dots\\12')) x = x.mul(3.186);
    if (hasUpgrade('dots\\20')) x = x.mul(1.15);
    if (isMilestoneAchieved('line\\10')) x = Decimal.add(player.dimensions[1],10).mul(x);

    return x
  },

  get exponents(): DecimalSource[] {
    const x = [DC.D0,DC.D0,DC.D1]

    if (hasUpgrade('dots\\11')) x[0] = x[0].add(1);
    // if (hasUpgrade('dots\\12')) x[1] = x[1].add(1);

    x[0] = x[0].add(getUpgradeEffect('line-seg\\2'))
    x[1] = x[1].add(getUpgradeEffect('line-seg\\1'))

    if (hasUpgrade('line-seg\\6')) x[0] = x[0].mul(1.56);
    if (hasUpgrade('line-seg\\10')) x[1] = x[1].mul(1.1);
    x[2] = x[2].mul(temp.string_effect)
    x[2] = x[2].mul(getUpgradeEffect('line-seg\\18'))

    return x
  },

  get effect(): DecimalSource {
    let x = Decimal.max(player.line_segments, 10).log10();

    x = x.pow(temp.string_effect)
    if (hasUpgrade('line-seg\\6')) x = x.pow(1.1);

    return x
  },

  get cap(): DecimalSource {
    if (isMilestoneAchieved('line\\10')) return DC.D1;

    let x = DC.D10

    if (isMilestoneAchieved('line\\6')) x = x.add(player.dimensions[1]);

    return x
  }
}

export const Strings = {
  get mult(): DecimalSource {
    let x = DC.D1

    x = x.mul(getUpgradeEffect('string\\2'))

    return x
  },

  require(x: DecimalSource): DecimalSource {
    let y = scale(x, ...temp.string_softcap1, 'P')

    y = y.div(this.mult).add(1).log10().add(1).pow(4/3).mul(19).pow10()

    return y
  },

  gain(x: DecimalSource): DecimalSource {
    if (Decimal.lt(x, 1e19)) return 0;

    let y = Decimal.log10(x).div(19).root(4/3).sub(1).pow10().sub(1).mul(this.mult)

    y = scale(y, ...temp.string_softcap1, 'P', true)

    return y.floor().add(1)
  },

  get effect(): DecimalSource {
    return Decimal.add(10, player.strings).log10().root(2)
  },
}

export function updateDimensionsTemp() {
  for (let i = 0; i < Dimensions.length; i++) temp.dimension_effects[i] = Dimensions[i].effect();

  temp.string_effect = Strings.effect

  temp.line_segments_mult = LineSegments.multiplier
  temp.line_segments_exp = LineSegments.exponents
  temp.line_segments_effect = LineSegments.effect
  temp.line_segments_cap = LineSegments.cap

  temp.dot_softcap1 = [
    Decimal.mul(1e10, getUpgradeEffect('dots\\21')).mul(getUpgradeEffect('dots\\23')).mul(getUpgradeEffect('string\\7')),
    Decimal.pow(4, hasUpgrade('dots\\25') ? .95 : 1)
  ]
  temp.string_softcap1 = [
    Decimal.mul(1e4, getUpgradeEffect('string\\10')),
    2
  ]
}
