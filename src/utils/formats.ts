import type { DecimalSource } from 'break_eternity.js'
import { FPS, player } from '../main'
import Decimal from 'break_eternity.js'

const ST_NAMES = [
  [],
  [
    ['', 'U', 'D', 'T', 'Qa', 'Qt', 'Sx', 'Sp', 'Oc', 'No'],
    ['', 'Dc', 'Vg', 'Tg', 'Qag', 'Qtg', 'Sxg', 'Spg', 'Ocg', 'Nog'],
    ['', 'Ce', 'De', 'Te', 'Qae', 'Qte', 'Sxe', 'Spe', 'Oce', 'Noe'],
  ],
  [
    ['', 'Mi', 'Mc', 'Na', 'Pc', 'Fm', 'At', 'Zp', 'Yc', 'Xn'],
    ['', 'Me', 'Du', 'Tr', 'Te', 'Pe', 'He', 'Hp', 'Ot', 'En'],
    ['', 'c', 'Ic', 'TCn', 'TeC', 'PCn', 'HCn', 'HpC', 'OCn', 'ECn'],
    ['', 'Hc', 'DHe', 'THt', 'TeH', 'PHc', 'HHe', 'HpH', 'OHt', 'EHc'],
  ],
]

const ST_TIERS = [
  () => {},
  (x: number): string => {
    return (
      ST_NAMES[1][0][x % 10] +
      ST_NAMES[1][1][Math.floor(x / 10) % 10] +
      ST_NAMES[1][2][Math.floor(x / 100)]
    )
  },
  (x: number): string => {
    const o = x % 10
    const t = Math.floor(x / 10) % 10
    const h = Math.floor(x / 100) % 10

    let r = ''
    if (x < 10) return ST_NAMES[2][0][x]
    if (t == 1 && o == 0) r += 'Vec'
    else r += ST_NAMES[2][1][o] + ST_NAMES[2][2][t]
    r += ST_NAMES[2][3][h]

    return r
  },
]

function formatCommas(num: DecimalSource, precision: number) {
  const d = new Decimal(num)

  return d.lt(0.5 * 10 ** -precision)
    ? '0'
    : d
        .toFixed(Math.max(0, precision - d.log10().floor().max(0).toNumber()))
        .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
}

export function format(
  num: DecimalSource,
  precision: number = 2,
  commas: number = 6,
  notation: string | number = player.options.notation,
): string {
  const d = new Decimal(num)

  if (d.sign == -1) return '-' + format(d.mul(-1),precision,commas,notation)

  if (d.sign == 0) return '0'

  if (!d.isFinite()) return '∞'

  const e = d.log10().floor()

  switch (notation) {
    case '0':
    case 'sc': {
      if (e.lt(commas)) return formatCommas(d, precision)

      const ee = e.log10().floor()

      if (d.gte('eeee15')) {
        const slog = d.slog()
        return (
          'E' +
          format(Decimal.tetrate(10, slog.mod(1).add(1).toNumber()), 3) +
          '#' +
          format(slog.floor().sub(1), 0)
        ) //(slog.gte(1e9)?'':E(10).pow(slog.sub(slog.floor())).toFixed(4)) + "F" + format(slog.floor(), 0)
      }

      return (
        (ee.lt(6) ? d.div(e.pow10()).toFixed(Math.max(0, 3 - ee.max(2).sub(2).toNumber())) : '') +
        'e' +
        format(e, 0, 9)
      )
    }
    case '1':
    case 'st': {
      let e3 = d.log(1e3).floor()
      if (e3.lt(1)) {
        return formatCommas(d, precision)
      } else {
        const e3_mul = e3.mul(3)
        const ee = e3.log10().floor()
        if (ee.gte(3000)) return 'e' + format(e, precision, commas, 'st')

        let final = ''
        if (e3.lt(4)) final = ['', 'K', 'M', 'B'][Math.round(e3.toNumber())]
        else {
          let ee3 = Math.floor(e3.log(1e3).toNumber())
          if (ee3 < 100) ee3 = Math.max(ee3 - 1, 0)
          e3 = e3.sub(1).div(Decimal.pow10(ee3 * 3))
          while (e3.gt(0)) {
            const div1000 = e3.div(1e3).floor()
            const mod1000 = e3.sub(div1000.mul(1e3)).floor().toNumber()
            if (mod1000 > 0) {
              if (mod1000 == 1 && !ee3) final = 'U'
              if (ee3) final = ST_TIERS[2](ee3) + (final ? '-' + final : '')
              if (mod1000 > 1) final = ST_TIERS[1](mod1000) + final
            }
            e3 = div1000
            ee3++
          }
        }

        const m = d.div(e3_mul.pow10())
        return (
          (ee.gte(10) ? '' : m.toFixed(Decimal.sub(3, e.sub(e3_mul)).max(0).toNumber())) + final
        )
      }
    }
    case '2':
    case 'mixed_sc': {
      if (e.lt(commas)) return formatCommas(d, precision)

      if (e.lt(63)) return format(d, precision, commas, 'st')

      return format(d, precision, commas, 'sc')
    }
    default:
      return format(d, precision, commas, 'mixed_sc')
  }
}

export const formatPlus = (x: DecimalSource, precision?: number) =>
  (Decimal.gte(x, 0) ? '+' : '') + format(x, precision)
export const formatMult = (x: DecimalSource, precision?: number) =>
  Decimal.lt(x, 1) ? '/' + format(Decimal.pow(x, -1)) : '×' + format(x, precision)
export const formatPow = (x: DecimalSource, precision?: number) => '^' + format(x, precision)
export const formatPercent = (x: DecimalSource, precision?: number) =>
  format(Decimal.mul(x, 100), precision) + '%'

const DT = Decimal.tetrate(10, 6)

export function formatGain(a: DecimalSource, e: DecimalSource) {
  const A = new Decimal(a)
  const g = Decimal.add(a, Decimal.div(e, FPS))

  if (g.neq(a)) {
    if (A.gte(DT)) {
      const oom = g.slog(10).sub(A.slog(10)).mul(FPS)
      if (oom.gte(1e-3)) return '(+' + format(oom) + ' OoMs^^2/s)'
    }

    if (A.gte('ee100')) {
      let tower = Math.floor(A.slog(10).toNumber() - 1.3010299956639813)

      let oom = g.iteratedlog(10, tower).sub(A.iteratedlog(10, tower)).mul(FPS),
        rated = false

      if (oom.gte(1)) rated = true
      else if (tower > 2) {
        tower--
        oom = g.iteratedlog(10, tower).sub(A.iteratedlog(10, tower)).mul(FPS)
        if (oom.gte(1)) rated = true
      }

      if (rated) return '(+' + format(oom) + ' OoMs^' + tower + '/s)'
    }

    if (A.gte(1e100)) {
      const oom = g.div(a).log10().mul(FPS)
      if (oom.gte(1)) return '(+' + format(oom) + ' OoMs/s)'
    }
  }

  return '(' + (Decimal.lt(e, 0) ? '' : '+') + format(e) + '/s)'
}

export function formatTime(a: DecimalSource) {
  if (!Decimal.isFinite(a)) return 'Forever'

  const A = new Decimal(a)

  if (A.gte(31536000)) return format(A) + ' years'
  if (A.gte(86400)) return format(A) + ' days'
  if (A.gte(60)) {
    const h = A.div(3600).floor().min(23),
      m = A.mod(3600).div(60).floor().min(59),
      s = A.mod(60).floor().min(59)

    return (
      (h.gt(0) ? h.toString().padStart(2, '0') + ':' : '') +
      m.toString().padStart(2, '0') +
      ':' +
      s.toString().padStart(2, '0')
    )
  }
  if (A.gte(1)) return format(A) + ' seconds'
  return format(A.mul(1e3)) + ' milliseconds'
}
