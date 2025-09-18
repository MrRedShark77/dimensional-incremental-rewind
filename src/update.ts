import type { DecimalSource } from 'break_eternity.js'
import { deepAssign } from './utils/saving'
import { Currencies, Currency } from './data/currencies'
import { player, temp } from './main'
import Decimal from 'break_eternity.js'
import { Dimensions, updateDimensionsTemp } from './data/dimensions'
import { purchaseUpgrade, RepeatableUpgradeAutomation, RepeatableUpgradeGroups, UpgradeCurrencyEL, UpgradeGroups, UpgradeKeys, UpgradeKeysPriority, Upgrades, UpgradesAll, UpgradesEL, type UpgradeEffect } from './data/upgrades'
import { isMilestoneAchieved, MilestoneKeys, Milestones } from './data/milestones'
import { DC } from './utils/decimal'
import { updateTabNotifications } from './data/tabs'

// Calculation

let diff = 0,
  date = Date.now()

export function loop() {
  // requestAnimationFrame(loop)

  diff = Date.now() - date // player.lastPlayed;
  calc(diff / 1000)

  updateTemp()
  document.body.style.setProperty('--font',['Roboto','RobotoMono','Consolas','CourierPrime','Cousine','Verdana'][player.options.font])

  date = Date.now() // player.lastPlayed
}

export function calc(dt: number) {
  for (const i in Currencies) {
    const C = Currencies[i as Currency]
    C.amount = Decimal.mul(temp.currencies[i], C.passive).mul(dt).add(C.amount)
  }

  for (let i = 0; i < Dimensions.length; i++) if (Dimensions[i].auto) player.dimensions[i] = Decimal.add(player.dimensions[i], temp.currencies[Dimensions[i].currency]);
  if (isMilestoneAchieved('line\\12')) player.strings = Decimal.add(player.strings, temp.currencies[Currency.Strings]);

  for (const i of MilestoneKeys) if (!player.milestones[i]) {
    const M = Milestones[i]
    if (!M.manual && M.condition()) player.milestones[i] = true;
  }

  for (const i in RepeatableUpgradeAutomation) if (RepeatableUpgradeAutomation[i]()) for (const j of RepeatableUpgradeGroups[i]) purchaseUpgrade(j);
}

// Temporary

export type Temp = {
  currencies: Record<string, DecimalSource>
  dimension_effects: DecimalSource[]

  dot_softcap1: [DecimalSource, DecimalSource]

  line_segments_mult: DecimalSource
  line_segments_exp: DecimalSource[]
  line_segments_effect: DecimalSource
  line_segments_cap: DecimalSource

  string_effect: DecimalSource
  string_softcap1: [DecimalSource, DecimalSource]

  upgrades: Record<string, UpgradeEffect>
  upgrades_max: Record<string, boolean>
  upgrades_el: Record<string, boolean>
  currencies_el: Record<string, boolean>
  total_repeatable_level: Record<string, DecimalSource>

  tab_notifications: Record<string, boolean>

  [index: string]: unknown
}

export function getTempData(): Temp {
  const T: Temp = {
    currencies: {},
    dimension_effects: [0,1,1],

    dot_softcap1: [1e10, 4],

    line_segments_mult: 1,
    line_segments_exp: [0,0,1],
    line_segments_effect: 1,
    line_segments_cap: 10,

    string_effect: 1,
    string_softcap1: [1e4, 2],

    upgrades: {},
    upgrades_max: {},
    upgrades_el: {},
    currencies_el: {},
    total_repeatable_level: {},

    tab_notifications: {},
  }

  for (const i in Currencies) T.currencies[i] = 0
  for (const i of UpgradeKeys) T.upgrades[i] = Upgrades[i].defaultEffect ?? 1;
  for (const i in UpgradeGroups) T.total_repeatable_level[i] = 0;

  return T
}

export function resetTemp() {
  deepAssign(temp, getTempData())
  updateTemp()
}

export function updateTemp() {
  temp.upgrades_max = {}
  temp.upgrades_el = {}

  for (const i in UpgradeGroups) {
    let x = DC.D0

    const max = UpgradesAll[i]?.() ?? false, el = UpgradesEL[i]?.() ?? false;

    for (const j of UpgradeGroups[i]) {
      if (Upgrades[j].repeatable) x = x.add(player.upgrades[j]);
      temp.upgrades_max[j] = max;
      temp.upgrades_el[j] = el;
    }

    temp.total_repeatable_level[i] = x;
  }

  temp.currencies_el = {}

  for (const i in UpgradeCurrencyEL) temp.currencies_el[i] = UpgradeCurrencyEL[i]();

  for (const i of UpgradeKeysPriority) {
    const U = Upgrades[i], level = player.upgrades[i];

    temp.upgrades[i] = U.effect?.(level) ?? 1
  }

  updateDimensionsTemp()

  for (const i in Currencies) temp.currencies[i] = Currencies[i as Currency].gain

  updateTabNotifications()
}
