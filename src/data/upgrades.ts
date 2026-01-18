import type { DecimalSource } from "break_eternity.js"
import { Currencies, Currency } from "./currencies"
import Decimal from "break_eternity.js"
import { player, temp } from "@/main"
import { format, formatMult, formatPlus, formatPow } from "@/utils/formats"
import { DC, expPow, softcap, sumBase } from "@/utils/decimal"
import { isMilestoneAchieved } from "./milestones"
import { splitIntoGroups } from "@/utils/other"
import { hasShapeTree } from "./shape_tree"

export type NormalUpgradeCost = [Currency | string, DecimalSource]
export type RepeatableUpgradeCost = [Currency | string, (x: DecimalSource) => DecimalSource, (x: DecimalSource) => DecimalSource]
// export type UpgradeEffect = DecimalSource | DecimalSource[] | Record<string, DecimalSource>

export type Upgrade = {
  description: string
  priority?: number

  condition?(): boolean
  cost: NormalUpgradeCost[] | RepeatableUpgradeCost[]
  repeatable?: boolean

  effect?: (x: DecimalSource) => DecimalSource
  defaultEffect?: DecimalSource
  effectDisplay?: (x: DecimalSource) => string

  [index: string]: unknown
}

export const Upgrades: Record<string, Upgrade> = {
  'dots\\1': {
    get description() {
      let s = hasUpgrade('dots\\4') ? '' : '^0.5'
      const exp = this.exp as DecimalSource;
      s = Decimal.neq(exp, 1) ? `(Dots${s}*${format(exp, 3)})` : 'Dots'+s
      return `Multiply Dot's effect by <b>Dots^${s}</b>.`
    },

    cost: [
      ['points', 30],
      ['dots', 3],
    ],

    get exp() { return getUpgradeEffect('dots\\7') },
    effect() {
      const x = Decimal.max(player.dimensions[0], 1)
      return softcap(x.pow(hasUpgrade('dots\\4') ? 1 : .5).mul(this.exp as DecimalSource).pow_base(x), 'ee30000', 0.5, "E", 2)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x),
  },
  'dots\\2': {
    condition: () => hasUpgrade('dots\\1'),
    get description() { return `Multiply Dot's effect by <b>lg(Points)^Dots</b>.` },

    cost: [
      ['points', 1e3],
      ['dots', 4],
    ],

    effect() {
      const x = Decimal.max(player.dimensions[0], 0)
      return softcap(Decimal.add(player.points, 10).log10().pow(x), 'ee30000', 0.5, "E", 2)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x),
  },
  'dots\\3': {
    condition: () => hasUpgrade('dots\\2'),
    get description() { return `Multiply Dot gain by <b>log2(log2(Points))^${format(this.base as DecimalSource,3)}</b>.` },

    cost: [
      ['points', 1e10],
      ['dots', 6],
    ],

    get base() { return Decimal.add(hasUpgrade('dots\\6') ? .3 : .25, getUpgradeEffect('dots\\9')) },
    effect() {
      return Decimal.add(player.points, 4).log2().log2().pow(this.base as DecimalSource).min(1e100)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x, 3),
  },
  'dots\\4': {
    condition: () => hasUpgrade('dots\\3'),
    get description() { return `The first dot upgrade is improved.` },

    cost: [
      ['points', 1e36],
      ['dots', 18],
    ],
  },
  'dots\\5': {
    condition: () => hasUpgrade('dots\\4'),
    get description() { return `You can buy max Dots, Dot effect exponent <b>^(1+${format(this.base as DecimalSource,3)}*log10(Dots))</b>.` },

    cost: [
      ['points', 1e145],
      ['dots', 38],
    ],

    get base() { return hasUpgrade('dots\\13') ? .01736 : .01 },
    effect() {
      let x = softcap(Decimal.add(player.dimensions[0], 1).log10().mul(this.base as DecimalSource).add(1), 2.1, .5, 'P')
      x = hasUpgrade('polygon\\4') ? softcap(x, 3.65, 1, "LOG") : x.min(3.65)
      return x
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x, 3),
  },
  'dots\\6': {
    condition: () => hasUpgrade('dots\\5'),
    get description() { return `<b>+0.05</b> to the exponent of the third dot upgrade.` },

    cost: [
      ['points', 1e196],
      ['dots', 45],
    ],
  },
  'dots\\7': {
    condition: () => isMilestoneAchieved('line\\1') && hasUpgrade('dots\\6'),
    get description() { return `Raise the first dot upgrade by <b>lg(Dots)^0.5${hasUpgrade('string\\4') ? `+10^lg(Dots)^0.5` : ''}</b>.` },

    cost: [
      ['points', 'e372'],
      ['dots', 71],
    ],

    effect() {
      let x = Decimal.add(player.dimensions[0], 10).log10().pow(.5)
      if (hasUpgrade('string\\4')) x = expPow(player.dimensions[0],.5).add(x);
      return x
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x, 3),
  },
  'dots\\8': {
    condition: () => hasUpgrade('dots\\7'),
    get description() { return `Raise Line effect by <b>Dots^${format(this.base as DecimalSource, 3)}</b>.` },

    cost: [
      ['points', 'e616'],
      ['dots', 93],
    ],

    get base() { return Decimal.add(hasUpgrade('dots\\16') ? .4 : .25, getUpgradeEffect('dots\\24')) },
    effect() {
      return softcap(Decimal.add(player.dimensions[0], 1).pow(this.base as DecimalSource), DC.DE308, 0.5, 'E')
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x),
  },
  'dots\\9': {
    condition: () => hasUpgrade('dots\\8'),
    get description() { return `Increase the exponent of the third dot upgrade by <b>+lg(lg(Points))/${format(this.base as DecimalSource)}</b>.` },
    priority: 1,

    cost: [
      ['points', 'e824'],
      ['dots', 109],
    ],

    get base() { return hasUpgrade('dots\\22') ? 20 : 100 },
    effect() {
      return Decimal.add(player.points, 10).log10().log10().div(this.base as DecimalSource)
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x, 3),
  },
  'dots\\10': {
    condition: () => hasUpgrade('dots\\9'),
    get description() { return `Raise Line effect by <b>slog10(Points)^1.666</b>.` },

    cost: [
      ['points', 'e1086'],
      ['dots', 136],
    ],

    effect() {
      return Decimal.add(player.points, 10).slog(10).pow(1.666).pow(getUpgradeEffect('dots\\18'))
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x),
  },
  'dots\\11': {
    condition: () => hasUpgrade('dots\\10'),
    get description() { return `Add <b>1</b> to OoM of Dots to Line Segments gain exponent.` },

    cost: [
      ['points', 'e8900'],
      ['dots', 430],
    ],
  },
  'dots\\12': {
    condition: () => hasUpgrade('dots\\11'),
    get description() { return `<b>×3.186</b> to Line Segments gain.` },

    cost: [
      ['points', 'e29136'],
      ['dots', 819],
    ],
  },
  'dots\\13': {
    condition: () => hasUpgrade('dots\\12'),
    get description() { return `Improve the fifth dot upgrade.` },

    cost: [
      ['points', 'e230184'],
      ['dots', 2502],
    ],
  },
  'dots\\14': {
    condition: () => hasUpgrade('dots\\13'),
    get description() { return `Multiply Dots gain by <b>Lines^${format(this.base as DecimalSource, 3)}</b>.` },

    cost: [
      ['points', 'e2207100'],
      ['dots', 8437],
    ],

    get base() {
      let x = .5
      if (hasUpgrade('line-seg\\8')) x += .155;
      if (hasUpgrade('dots\\19')) x += .345;
      return x
    },
    effect() {
      return Decimal.max(player.dimensions[1], 1).pow(this.base as DecimalSource)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x),
  },
  'dots\\15': {
    condition: () => hasUpgrade('dots\\14'),
    get description() { return `Raise Line effect exponent by <b>1+lg(lg(Dots))/5</b>.` },

    cost: [
      ['points', 'e11124643'],
      ['dots', 34768],
    ],

    effect() {
      return Decimal.add(player.dimensions[0], 10).log10().log10().div(5).add(1)
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x, 4),
  },
  'dots\\16': {
    condition: () => hasUpgrade('dots\\15'),
    get description() { return `<b>+0.15</b> to the exponent of the eighth dot upgrade.` },

    cost: [
      ['points', 'e1.5e11'],
      ['dots', 1.545e7],
    ],
  },
  'dots\\17': {
    condition: () => hasUpgrade('dots\\16'),
    get description() { return `Increase points gain exponent by <b>+7.5%</b> per OoM^2 of points.` },

    cost: [
      ['points', 'e2.79e12'],
      ['dots', 1e8],
    ],

    effect() {
      return Decimal.max(player.points, 10).log10().log10().mul(.075).add(1)
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x, 3),
  },
  'dots\\18': {
    condition: () => hasUpgrade('dots\\17'),
    get description() { return `Raise the 10th dot upgrade by <b>Lines^0.9</b>.` },
    priority: 1,

    cost: [
      ['points', 'e1.1465e17'],
      ['dots', 1.428e10],
    ],

    effect() {
      return Decimal.max(player.dimensions[1], 1).pow(.9)
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x, 3),
  },
  'dots\\19': {
    condition: () => hasUpgrade('dots\\18'),
    get description() { return `Improve the seventh line upgrade and <b>+0.345</b> to the exponent of the 14th dot upgrade.` },

    cost: [
      ['points', 'e2.678e19'],
      ['dots', 2.9435e10],
    ],
  },
  'dots\\20': {
    condition: () => hasUpgrade('dots\\19'),
    get description() { return `Increase the base of the seventh line upgrade by <b>lg(Dots)/20</b>, multiply line segments gain by <b>1.15</b>.` },
    priority: 1,

    cost: [
      ['points', 'e1.925e21'],
      ['dots', 9.522e10],
    ],

    effect() {
      return Decimal.add(player.dimensions[0], 1).log10().div(20)
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x, 3),
  },
  'dots\\21': {
    condition: () => hasUpgrade('dots\\20'),
    get description() { return `Multiply Dots gain softcap start by <b>lg(String)^3</b>.` },

    cost: [
      ['points', 'e3.072e23'],
      ['dots', 6.1135e11],
    ],

    effect() {
      return Decimal.add(player.strings, 10).log10().pow(3)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x, 3),
  },
  'dots\\22': {
    condition: () => hasUpgrade('dots\\21'),
    get description() { return `Multiply the 9th dot upgrade effect by <b>5</b>.` },

    cost: [
      ['points', 'e5.391e23'],
      ['dots', 1.308e12],
    ],
  },
  'dots\\23': {
    condition: () => hasUpgrade('dots\\22'),
    get description() { return `Multiply Dots gain softcap start by <b>lg(lg(lg(Points)))^1.25</b>.` },

    cost: [
      ['points', 'e1.093e29'],
      ['dots', 2.4496e14],
    ],

    effect() {
      return Decimal.add(player.points, 1).log10().add(1).log10().add(1).log10().add(1).pow(1.25)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x, 3),
  },
  'dots\\24': {
    condition: () => hasUpgrade('dots\\23'),
    get description() { return `Increase the exponent of the eighth dot upgrade by <b>+lg(String)/20</b>.` },
    priority: 1,

    cost: [
      ['points', 'e3.7495e36'],
      ['dots', 1.39e17],
    ],

    effect() {
      return Decimal.add(player.strings, 1).log10().div(20)
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x, 3),
  },
  'dots\\25': {
    condition: () => hasUpgrade('dots\\24'),
    get description() { return `Dots gain softcap is <b>5%</b> weaker.` },

    cost: [
      ['points', 'e2.119e143'],
      ['dots', 2.20151e44],
    ],
  },
  'dots\\26': {
    condition: () => hasUpgrade('dots\\25'),
    get description() { return `Multiply Lines gain by <b>1+lg(lg(lg(Points)))/6</b>.` },

    cost: [
      ['points', 'e8.396e168'],
      ['dots', 3.688e51],
    ],

    effect() {
      return Decimal.max(player.points, 'e10').log10().log10().log10().div(6).add(1)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x, 3),
  },
  'dots\\27': {
    condition: () => hasUpgrade('dots\\26'),
    get description() { return `Improve the first string upgrade further.` },

    cost: [
      ['points', 'e3.841e311'],
      ['dots', 6.52751e88],
    ],
  },
  'dots\\28': {
    condition: () => isMilestoneAchieved('shape\\1') && hasUpgrade('dots\\27'),
    get description() { return `Multiply Lines gain by <b>1+0.284*Shapes</b>.` },

    cost: [
      ['points', 'e6.246e2819'],
      ['dots', '4.1135e627'],
    ],
    effect() {
      return Decimal.mul(player.dimensions[2], .284).add(1)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x,3),
  },
  'dots\\29': {
    condition: () => isMilestoneAchieved('shape\\2') && hasUpgrade('dots\\28'),
    get description() { return `Multiply Polygons gain and cap by <b>${hasUpgrade('dots\\30') ? '2^' : ''}slog10(points)</b>.` },

    cost: [
      ['points', 'e2.651e18724'],
      ['dots', '3.27e1143'],
    ],
    effect() {
      let x = Decimal.add(player.points, 10).slog(10)
      if (hasUpgrade('dots\\30')) x = x.pow_base(2);
      return x
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x,3),
  },
  'dots\\30': {
    condition: () => hasUpgrade('dots\\29'),
    get description() { return `Improve the previous dot upgrade.` },

    cost: [
      ['points', 'e1.451e90476'],
      ['dots', '3.6351e1805'],
    ],
  },

  'line-seg\\1': {
    repeatable: true,
    get description() { return `Add <b>1</b> to Lines to Line Segments gain exponent per level.` },

    cost: [
      ['line-segments', x => Decimal.pow(x,1.5).pow_base(3).mul(100), x => Decimal.div(x, 100).log(3).root(1.5).add(1).floor()],
    ],

    get soft_exp() {
      let x = .5
      if (hasUpgrade('string\\3')) x += .05;
      if (hasShapeTree('2-1')) x += .05;
      return x
    },
    effect(x) {
      return softcap(x, 25, this.soft_exp as DecimalSource, 'P')
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x),
  },
  'line-seg\\2': {
    condition: () => hasUpgrade('line-seg\\1'),
    repeatable: true,
    get description() { return `Add <b>${format(this.base as DecimalSource)}</b> to OoM of Dots to Line Segments gain exponent per level.` },

    cost: [
      ['line-segments', x => Decimal.pow(x,1.5).pow_base(4.37).mul(200), x => Decimal.div(x, 200).log(4.37).root(1.5).add(1).floor()],
    ],

    get soft_exp() {
      let x = .5
      if (hasUpgrade('string\\3')) x += .05;
      if (hasShapeTree('2-1')) x += .05;
      return x
    },
    get base() { return Decimal.add(.5, getUpgradeEffect('line-seg\\12')) },
    effect(x) {
      return softcap(Decimal.mul(x,this.base as DecimalSource), 10, this.soft_exp as DecimalSource, 'P')
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x),
  },
  'line-seg\\3': {
    condition: () => hasUpgrade('line-seg\\2'),
    get description() { return `Base Lines effect past <b>${format('ee3')}</b> boost their effect base.` },

    cost: [
      ['dots', 6720],
      ['line-segments', 12605],
    ],

    effect() {
      return expPow(Decimal.max(player.points, 'ee6'), 0.5).log10().pow(1000/3).div('ee3').pow(7.2)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x),
  },
  'line-seg\\4': {
    condition: () => hasUpgrade('line-seg\\3'),
    get description() { return `Multiply Line Segments gain by <b>lg(Line Segments)^${format(this.base as DecimalSource)}</b>.` },

    cost: [
      ['dots', 193550],
      ['line-segments', 4820900],
    ],

    get base() { return Decimal.add(1, getUpgradeEffect('line-seg\\13')) },
    effect() {
      return Decimal.add(10, player.line_segments).log10().pow(this.base as DecimalSource)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x),
  },
  'line-seg\\5': {
    condition: () => hasUpgrade('line-seg\\4'),
    get description() { return `Multiply Line Segments gain by <b>lg(lg(Points))^${format(this.base as DecimalSource)}</b>.` },

    cost: [
      ['dots', 261531],
      ['line-segments', 4.162e8],
    ],

    get base() { return Decimal.add(1, getUpgradeEffect(hasUpgrade('line-seg\\19') ? 'line-seg\\13' : 'line-seg\\14')) },
    effect() {
      return Decimal.max(1e10, player.points).log10().log10().pow(this.base as DecimalSource)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x),
  },
  'line-seg\\6': {
    condition: () => hasUpgrade('line-seg\\5'),
    get description() { return `Multiply OoM of Dots to Line Segments gain exponent by <b>1.56</b>, raise Line Segments effect by <b>1.1</b>.` },

    cost: [
      ['dots', 338396],
      ['line-segments', 4.566e10],
    ],
  },
  'line-seg\\7': {
    condition: () => hasUpgrade('line-seg\\6'),
    repeatable: true,
    get description() { return `Multiply Dots gain by <b>${format(this.base as DecimalSource)}</b> per ${hasUpgrade('dots\\19') ? '' : 'square-rooted '}level.` },

    cost: [
      ['line-segments', x => Decimal.pow(x,2).pow_base(2).mul(5e15), x => Decimal.div(x, 5e15).log(2).root(2).add(1).floor()],
    ],

    get base() { return Decimal.add(1.3, getUpgradeEffect('dots\\20')) },
    effect(x) {
      let y = Decimal.root(x, hasUpgrade('dots\\19') ? 1 : 2).pow_base(this.base as DecimalSource)
      if (!hasShapeTree('2-2')) y = softcap(y, 1e10, 0.5, 'E');
      return y
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x, 3),
  },
  'line-seg\\8': {
    condition: () => hasUpgrade('line-seg\\7'),
    get description() { return `<b>+0.155</b> to the exponent of the 14th dot upgrade.` },

    cost: [
      ['dots', 1.595e6],
      ['line-segments', 7.944e15],
    ],
  },
  'line-seg\\9': {
    condition: () => hasUpgrade('line-seg\\8'),
    get description() { return `Increase Dots gain by <b>${hasUpgrade('line-seg\\15') ? '+2.225% compounding' : '+1.08%'}</b> per repeatable line upgrades' level.` },

    cost: [
      ['dots', 4.787e7],
      ['line-segments', 9.591e20],
    ],

    effect() {
      return hasUpgrade('line-seg\\15') ? Decimal.pow(1.02225, temp.total_repeatable_level['line-seg']) : Decimal.mul(temp.total_repeatable_level['line-seg'], .0108).add(1)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x, 3),
  },
  'line-seg\\10': {
    condition: () => hasUpgrade('line-seg\\9'),
    get description() { return `Multiply Lines to Line Segments gain exponent by <b>1.1</b>.` },

    cost: [
      ['dots', 1.133e9],
      ['line-segments', 2.222e25],
    ],
  },
  'line-seg\\11': {
    condition: () => hasUpgrade('line-seg\\10'),
    repeatable: true,
    get description() { return `Raise points gain by <b>${format(this.base as DecimalSource)}</b> per level.` },

    cost: [
      ['line-segments', x => Decimal.pow(x,2.25).pow_base(1.1).mul(6.4e28), x => Decimal.div(x, 6.4e28).log(1.1).root(2.25).add(1).floor()],
    ],

    get base() { return Decimal.add(1.5, getUpgradeEffect('string\\5')) },
    effect(x) {
      return Decimal.pow(this.base as DecimalSource, x)
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x),
  },
  'line-seg\\12': {
    condition: () => hasUpgrade('line-seg\\11'),
    get description() { return `Increase the base of the second line upgrade by <b>slog10(points)/${hasUpgrade('line-seg\\16') ? 25 : 50}</b>.` },
    priority: 1,

    cost: [
      ['dots', 2.549e11],
      ['line-segments', 7.5525e37],
    ],

    effect() {
      return Decimal.add(player.points, 1).slog(10).div(hasUpgrade('line-seg\\16') ? 25 : 50)
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x, 3),
  },
  'line-seg\\13': {
    condition: () => hasUpgrade('line-seg\\12'),
    repeatable: true,
    get description() { return `Add <b>${format(this.base as DecimalSource)}</b> to the exponent of the fourth line upgrade per level.` },
    priority: 2,

    cost: [
      ['line-segments', x => {
        let s = 1.2
        if (isMilestoneAchieved('line\\11')) s -= .05;
        if (hasUpgrade('line-seg\\22')) s -= .05;
        return Decimal.pow(s,x).mul(54).pow10()
      }, x => {
        let s = 1.2
        if (isMilestoneAchieved('line\\11')) s -= .05;
        if (hasUpgrade('line-seg\\22')) s -= .05;
        return Decimal.log10(x).div(54).log(s).add(1).floor()
      }],
    ],

    get base() { return Decimal.add(0.5, getUpgradeEffect('string\\9')) },
    effect(x) {
      return Decimal.mul(x, this.base as DecimalSource)
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x),
  },
  'line-seg\\14': {
    condition: () => hasUpgrade('line-seg\\13'),
    get description() { return `The previous upgrade affects the fifth line upgrade at a reduced rate.` },
    priority: 1,

    cost: [
      ['dots', 7.7956e14],
      ['line-segments', 4.2086e91],
    ],

    effect() {
      return Decimal.add(getUpgradeEffect('line-seg\\13'),1).root(2).sub(1)
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x,3),
  },
  'line-seg\\15': {
    condition: () => hasUpgrade('line-seg\\14'),
    get description() { return `Improve the ninth line upgrade.` },

    cost: [
      ['dots', 4.496e19],
      ['line-segments', 5.9385e227],
    ],
  },
  'line-seg\\16': {
    condition: () => hasUpgrade('line-seg\\15'),
    get description() { return `Improve the 12th line upgrade.` },

    cost: [
      ['dots', 5.872e20],
      ['line-segments', 2.316e239],
    ],
  },
  'line-seg\\17': {
    condition: () => hasUpgrade('line-seg\\16'),
    get description() { return `Multiply Dots gain by <b>lg(Line Segments)^${format(this.base as DecimalSource)}</b>.` },
    priority: 1,

    cost: [
      ['dots', 3.1165e24],
      ['line-segments', '4.9625e347'],
    ],

    get base() { return Decimal.add(1, hasUpgrade('string\\12') ? getUpgradeEffect('line-seg\\14') : 0) },
    effect() {
      return Decimal.add(player.line_segments, 10).log10().pow(this.base as DecimalSource)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x),
  },
  'line-seg\\18': {
    condition: () => hasUpgrade('line-seg\\17'),
    get description() { return `Raise Line Segments gain by <b>1+lg(Lines)/10</b>.` },

    cost: [
      ['dots', 5.393e25],
      ['line-segments', '3.8125e360'],
    ],

    effect() {
      return Decimal.add(player.dimensions[1], 1).log10().div(10).add(1)
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x, 3),
  },
  'line-seg\\19': {
    condition: () => isMilestoneAchieved('shape\\2') && hasUpgrade('line-seg\\18'),
    get description() { return `The fifth line upgrade is affected by the 13th line upgrade instead of 14th.` },

    cost: [
      ['dots', '2.77e1016'],
      ['line-segments', '9.6e47831'],
    ],
  },
  'line-seg\\20': {
    condition: () => hasUpgrade('line-seg\\19'),
    get description() { return `Raise points gain by <b>1+lg(lg(Line Segments))/${hasUpgrade('line-seg\\21') ? 7.06 : 10}</b> to the exponent.` },

    cost: [
      ['dots', '3.906e1078'],
      ['line-segments', '2.51e138614'],
    ],

    effect() {
      return Decimal.add(player.line_segments, 10).log10().log10().div(hasUpgrade('line-seg\\21') ? 7.06 : 10).add(1)
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x, 3),
  },
  'line-seg\\21': {
    condition: () => hasUpgrade('line-seg\\20'),
    get description() { return `Improve the previous line upgrade.` },

    cost: [
      ['dots', '5.3e32115'],
      ['line-segments', '5e409724'],
    ],
  },
  'line-seg\\22': {
    condition: () => hasUpgrade('line-seg\\21'),
    get description() { return `The 13th line upgrade's cost scaling is reduced.` },

    cost: [
      ['dots', 'e6331910'],
      ['line-segments', 'e1288669'],
    ],
  },
  'line-seg\\23': {
    condition: () => hasUpgrade('line-seg\\22'),
    get description() { return `Raise Line Segments gain and effect by <b>lg(lg(Polygons))</b>.` },

    cost: [
      ['dots', 'e5.4205e9'],
      ['line-segments', 'e5311229'],
    ],

    effect() {
      return Decimal.add(player.polygons, 10).log10().log10().add(1)
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x,3),
  },
  'line-seg\\24': {
    condition: () => hasUpgrade('line-seg\\23'),
    get description() { return `Multiply Lines gain softcap start by <b>lg(lg(lg(Line Segments)))^1.94294554745</b>.<br><i>Are you serious?</i>` },

    cost: [
      ['dots', 'e4.023e11'],
      ['line-segments', 'e85881185'],
    ],

    effect() {
      return Decimal.add(player.line_segments, 1).log10().add(1).log10().add(1).log10().add(1).pow(1.94294554745)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x, 3),
  },

  'string\\1': {
    condition: () => isMilestoneAchieved('line\\9'),
    get description() { return `Multiply Lines gain by <b>1+lg(lg(String))/${hasUpgrade('string\\6') ? 2.5 : 10}${hasUpgrade('dots\\27') ? `+lg(String)/61`:""}</b>.` },

    cost: [
      ['line-segments', 2.0715e168],
      ['strings', 11600],
    ],

    effect() {
      let x = Decimal.add(player.strings,10).log10().log10().div(hasUpgrade('string\\6') ? 2.5 : 10).add(1)
      if (hasUpgrade('dots\\27')) x = x.add(Decimal.add(player.strings,1).log10().div(61))
      return x
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x,3),
  },
  'string\\2': {
    condition: () => hasUpgrade('string\\1'),
    get description() { return `Multiply String length by <b>log2(Lines)</b>.` },

    cost: [
      ['line-segments', 1.593e178],
      ['strings', 15100],
    ],

    effect() {
      return Decimal.max(player.dimensions[1],2).log2()
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x,3),
  },
  'string\\3': {
    condition: () => hasUpgrade('string\\2'),
    get description() { return `Automate repeatable line upgrades. The softcap of the first 2 line upgrades is weaker.` },

    cost: [
      ['line-segments', 2.8426e190],
      ['strings', 37750],
    ],
  },
  'string\\4': {
    condition: () => hasUpgrade('string\\3'),
    get description() { return `Improve the seventh dot upgrade.` },

    cost: [
      ['line-segments', 4.369e228],
      ['strings', 100000],
    ],
  },
  'string\\5': {
    condition: () => hasUpgrade('string\\4'),
    get description() { return `Add <b>lg(String)/10</b> to the base of the 11th line upgrade.` },
    priority: 1,

    cost: [
      ['line-segments', 3.792e253],
      ['strings', 182300],
    ],

    effect() {
      return Decimal.add(player.strings,1).log10().div(10)
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x,3),
  },
  'string\\6': {
    condition: () => hasUpgrade('string\\5'),
    get description() { return `Improve the first string upgrade.` },

    cost: [
      ['line-segments', 2.2786e304],
      ['strings', 603600],
    ],
  },
  'string\\7': {
    condition: () => hasUpgrade('string\\6'),
    get description() { return `Multiply Dots gain softcap start by <b>10^lg(String)^0.5</b>.` },

    cost: [
      ['line-segments', '1.543e571'],
      ['strings', 1.695e8],
    ],

    effect() {
      return expPow(Decimal.add(player.strings,1),.5)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x,3),
  },
  'string\\8': {
    condition: () => hasUpgrade('string\\7'),
    get description() { return `Multiply Dots gain by <b>Lines^Lines^0.5</b>.` },

    cost: [
      ['line-segments', '5.697e641'],
      ['strings', 6.656e8],
    ],

    effect() {
      const x = Decimal.max(1, player.dimensions[1])
      return x.pow(x.pow(.5))
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x,3),
  },
  'string\\9': {
    condition: () => hasUpgrade('string\\8'),
    get description() { return `Add <b>lg(String)/100</b> to the base of the 13th line upgrade.` },
    priority: 3,

    cost: [
      ['line-segments', '1.2715e708'],
      ['strings', 2.325e9],
    ],

    effect() {
      return Decimal.add(player.strings,1).log10().div(100)
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x,3),
  },
  'string\\10': {
    condition: () => hasUpgrade('string\\9'),
    get description() { return `Multiply length of String softcap start by <b>Lines</b>.` },

    cost: [
      ['line-segments', '7.1806e811'],
      ['strings', 1.5276e10],
    ],

    effect() {
      return Decimal.max(player.dimensions[1],1)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x),
  },
  'string\\11': {
    condition: () => hasUpgrade('string\\10'),
    get description() { return `Multiply Dots gain by <b>lg(Dots)^Lines^0.5</b>.` },

    cost: [
      ['line-segments', '2.61e1513'],
      ['strings', 1.066e16],
    ],

    effect() {
      return Decimal.add(10, player.dimensions[0]).log10().pow(Decimal.pow(player.dimensions[1],.5))
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x,3),
  },
  'string\\12': {
    condition: () => hasUpgrade('string\\11'),
    get description() { return `You can buy max Lines. The 14th line upgrade affects the 17th line upgrade normally.` },

    cost: [
      ['line-segments', '3.8751e1749'],
      ['strings', 4.019e17],
    ],
  },

  'polygon\\1': {
    repeatable: true,
    get description() { return `Multiply Polygons gain by <b>${format(this.base as DecimalSource)}</b> per level.` },

    cost: [
      ['polygons', x => sumBase(x,1.01).pow_base(3).mul(10), x => sumBase(Decimal.div(x, 10).log(3),1.01,true).add(1).floor()],
    ],

    get base() { return Decimal.add(2, getUpgradeEffect('polygon\\9')).add(getUpgradeEffect('polygon\\12')) },
    effect(x) {
      return Decimal.pow(this.base as DecimalSource, x)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x),
  },
  'polygon\\2': {
    condition: () => hasUpgrade('polygon\\1'),
    repeatable: true,
    get description() { return `Add <b>1</b> to Shapes to Polygons cap exponent per level.` },

    cost: [
      ['polygons', x => Decimal.pow(x,1.5).pow_base(4).mul(100), x => Decimal.div(x, 100).log(4).root(1.5).add(1).floor()],
    ],

    get soft_exp() {
      let x = .5
      x = x
      return x
    },
    effect(x) {
      return softcap(x, 25, this.soft_exp as DecimalSource, 'P')
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x),
  },
  'polygon\\3': {
    condition: () => hasUpgrade('polygon\\2'),
    repeatable: true,
    get description() { return `Add <b>${format(this.base as DecimalSource)}</b> to OoM of Line Segments to Polygons cap exponent per level.` },

    cost: [
      ['polygons', x => Decimal.pow(x,1.5).pow_base(5).mul(200), x => Decimal.div(x, 200).log(5).root(1.5).add(1).floor()],
    ],

    get soft_exp() {
      let x = .5
      x = x
      return x
    },
    get base() { return .25 },
    effect(x) {
      return softcap(Decimal.mul(x,this.base as DecimalSource), 10, this.soft_exp as DecimalSource, 'P')
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x),
  },
  'polygon\\4': {
    condition: () => hasUpgrade('polygon\\3'),
    get description() { return `The fifth dot upgrade is softcapped again instead of capped.` },

    cost: [
      ['polygons', '327407.51'],
      ['lines', '4849'],
    ],
  },
  'polygon\\5': {
    condition: () => hasUpgrade('polygon\\4'),
    get description() { return `Multiply Polygons gain and cap by <b>lg(Polygons)</b>.` },

    cost: [
      ['polygons', '1.486e7'],
      ['lines', '6389'],
    ],

    effect() {
      return Decimal.add(player.polygons, 10).log10()
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x),
  },
  'polygon\\6': {
    condition: () => hasUpgrade('polygon\\5'),
    get description() { return `Raise Line effect exponent by <b>1+lg(Lines)/2</b>.` },

    cost: [
      ['polygons', '1.340e9'],
      ['lines', '11886'],
    ],

    effect() {
      return Decimal.add(player.dimensions[1], 1).log10().div(2).add(1)
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x,3),
  },
  'polygon\\7': {
    condition: () => hasUpgrade('polygon\\6'),
    repeatable: true,
    get description() { return `Multiply Lines gain by <b>${format(this.base as DecimalSource)}</b> per square-rooted level.` },

    cost: [
      ['polygons', x => Decimal.pow(x,2).pow_base(2).mul(1e12), x => Decimal.div(x, 1e12).log(2).root(2).add(1).floor()],
    ],

    get base() { return 1.25 },
    effect(x) {
      let y = Decimal.root(x, 2).pow_base(this.base as DecimalSource)
      y = softcap(y, 1e10, 0.5, 'E');
      return y
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x, 3),
  },
  'polygon\\8': {
    condition: () => hasUpgrade('polygon\\7'),
    get description() { return `Multiply OoM of Line Segments to Polygons cap exponent by <b>1.5</b>, raise Polygon effect by <b>1.1</b>.` },

    cost: [
      ['polygons', '7.723e13'],
      ['lines', '1.237e6'],
    ],
  },
  'polygon\\9': {
    condition: () => hasUpgrade('polygon\\8'),
    get description() { return `Increase the base of the first polygon upgrade by <b>Shapes/8</b>.` },
    priority: 1,

    cost: [
      ['polygons', '6e16'],
    ],
    effect() {
      return Decimal.div(player.dimensions[2],8)
    },
    defaultEffect: 1,
    effectDisplay: x => formatPlus(x, 3),
  },
  'polygon\\10': {
    condition: () => hasUpgrade('polygon\\9'),
    get description() { return `Multiply Lines gain by <b>1+lg(Polygons)/128</b>.` },

    cost: [
      ['polygons', '6.347e17'],
      ['lines', '1.061e7'],
    ],

    effect() {
      return Decimal.add(player.polygons,1).log10().div(128).add(1)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x,3),
  },
  'polygon\\11': {
    condition: () => hasUpgrade('polygon\\10'),
    repeatable: true,
    get description() { return `Raise points gain by <b>${format(this.base as DecimalSource)}</b> to the exponent per level.` },

    cost: [
      ['polygons', x => Decimal.pow(x,2.3).pow_base(1.15).mul(3.929e22), x => Decimal.div(x, 3.929e22).log(1.15).root(2.3).add(1).floor()],
    ],

    get base() { return Decimal.add(1.4, 0) },
    effect(x) {
      return Decimal.pow(this.base as DecimalSource, x)
    },
    defaultEffect: 1,
    effectDisplay: x => formatPow(x),
  },
  'polygon\\12': {
    condition: () => hasUpgrade('polygon\\11'),
    get description() { return `Increase the base of the first polygon upgrade by <b>+0.15*slog10(points)</b>.` },
    priority: 1,

    cost: [
      ['polygons', '1e27'],
    ],
    effect() {
      return Decimal.add(player.points, 1).slog(10).mul(.15)
    },
    defaultEffect: 0,
    effectDisplay: x => formatPlus(x, 3),
  },
}

export const UpgradeKeys = Object.keys(Upgrades)
export const [NonRepeatableUpgradeKeys, RepeatableUpgradeKeys] = (() => {
  const a: string[] = [], b: string[] = []
  UpgradeKeys.forEach(x => {
    Upgrades[x].condition ??= () => true;
    Upgrades[x].priority ??= 0;
    (Upgrades[x].repeatable ? b : a).push(x)
  })
  return [a, b]
})()
export const UpgradeKeysPriority = Object.keys(Upgrades).sort((x,y) => Upgrades[y].priority! - Upgrades[x].priority!)

export const UpgradeGroups: Record<string, string[]> = splitIntoGroups(UpgradeKeys)
export const [NonRepeatableUpgradeGroups, RepeatableUpgradeGroups] = (() => {
  const a: Record<string, string[]> = {}, b: Record<string, string[]> = {}
  UpgradeKeys.map(x => [x.split("\\")[0],x]).forEach(([x,y]) => (Upgrades[y].repeatable ? (b[x] ??= []).push(y) : (a[x] ??= []).push(y)))
  return [a, b]
})()

export const UpgradesAll: Record<string, () => boolean> = {
  'line-seg': () => isMilestoneAchieved('line\\7'),
}
export const UpgradesEL: Record<string, () => boolean> = {
  'line-seg': () => isMilestoneAchieved('line\\7'),
}
export const UpgradeCurrencyEL: Record<string, () => boolean> = {
  'strings': () => true,
}
export const RepeatableUpgradeAutomation: Record<string, () => boolean> = {
  'line-seg': () => hasUpgrade('string\\3'),
}

export function hasUpgrade(id: string, level: DecimalSource = 1) : boolean { return Decimal.gte(player.upgrades[id], level) }
export function getUpgradeEffect(id: string) { return Decimal.gte(player.upgrades[id], 1) ? temp.upgrades[id] : Upgrades[id].defaultEffect ?? 1 }
export function getUpgradeCosts(id: string, level: DecimalSource = player.upgrades[id]) {
  const U = Upgrades[id]
  return U.repeatable ? (U.cost as RepeatableUpgradeCost[]).map(x=>x[1](level)) : (U.cost as NormalUpgradeCost[]).map(x=>x[1])
}
export function resetUpgradesByGroup(id: string, keep: string[] = []) { for (const i of UpgradeGroups[id]) if (!keep.includes(i)) player.upgrades[i] = 0; }

export function purchaseUpgrade(id: string, max: boolean = temp.upgrades_max[id]) {
  const U = Upgrades[id], level = player.upgrades[id]

  if (!(player.discovered_upgrades[id] || (U.condition?.() ?? true)) || !U.repeatable && Decimal.gte(level, 1)) return;

  let costs = getUpgradeCosts(id, level);

  if (U.cost.every(([x],i) => Decimal.gte(Currencies[x as Currency].amount, costs[i]))) {
    let bulk = Decimal.add(level, 1)
    if (max && U.repeatable) {
      let min = DC.DINF
      for (const x of U.cost as RepeatableUpgradeCost[]) min = min.min(x[2](Currencies[x[0] as Currency].amount));
      if (min.gt(bulk)) {
        bulk = min
        if (!temp.upgrades_el[id]) costs = getUpgradeCosts(id, min.sub(1));
      }
    }
    player.upgrades[id] = bulk
    if (!temp.upgrades_el[id]) U.cost.forEach(([x],i) => {
      if (temp.currencies_el[x]) return;
      const C = Currencies[x as Currency]
      C.amount = Decimal.sub(C.amount, costs[i]).max(0)
    })
    player.discovered_upgrades[id] = true
  }
}

export function getUpgradesNotification(group: string): boolean {
  const rep_auto = RepeatableUpgradeAutomation[group]?.() ?? false
  for (const id of UpgradeGroups[group]) {
    const U = Upgrades[id], level = player.upgrades[id]
    if (!(player.discovered_upgrades[id] || (U.condition?.() ?? true)) || (U.repeatable ? rep_auto : Decimal.gte(level, 1))) continue;
    const costs = getUpgradeCosts(id, level);
    if (U.cost.every(([x],i) => Decimal.gte(Currencies[x as Currency].amount, costs[i]))) return true;
  }

  return false
}
