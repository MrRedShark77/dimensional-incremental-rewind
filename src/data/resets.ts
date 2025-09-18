import type { DecimalSource } from "break_eternity.js"
import { Currencies, Currency } from "./currencies"
import { Dimension, Dimensions, Strings } from "./dimensions"
import Decimal from "break_eternity.js"
import { player, temp } from "@/main"
import { resetTemp } from "@/update"
import { NonRepeatableUpgradeGroups, resetUpgradesByGroup } from "./upgrades"
import { checkMilestones, isMilestoneAchieved, resetMilestonesByGroup } from "./milestones"

export const Resets: Record<string, {
  currency: Currency
  gain: Currency

  next: DecimalSource

  onreset?(): void
  reset(): void
}> = {
  dots: {
    currency: Currency.Points,
    gain: Currency.Dots,

    get next() { return Dimensions[Dimension.Dot].next(Decimal.add(Currencies[this.gain].amount, temp.currencies[this.gain])) },

    reset() {
      player.points = 0

      resetTemp()
    },
  },
  lines: {
    currency: Currency.Dots,
    gain: Currency.Lines,

    get next() { return Dimensions[Dimension.Line].next(Decimal.add(Currencies[this.gain].amount, temp.currencies[this.gain])) },

    onreset() {
      checkMilestones('line')
    },
    reset() {
      player.dimensions[0] = 1
      if (!isMilestoneAchieved('line\\5')) resetUpgradesByGroup('dots');

      Resets.dots.reset();
    },
  },
  strings: {
    currency: Currency.LineSegments,
    gain: Currency.Strings,

    get next() { return Strings.require(Decimal.add(Currencies[this.gain].amount, temp.currencies[this.gain])) },

    onreset() {
      checkMilestones('line')
    },
    reset() {
      player.line_segments = 0
      resetUpgradesByGroup('line-seg', isMilestoneAchieved('line\\8') ? NonRepeatableUpgradeGroups['line-seg'] : []);

      Resets.lines.reset();
    },
  },
  shapes: {
    currency: Currency.Lines,
    gain: Currency.Shapes,

    get next() { return Dimensions[Dimension.Shape].next(Decimal.add(Currencies[this.gain].amount, temp.currencies[this.gain])) },

    onreset() {
      // checkMilestones('shape')
    },
    reset() {
      player.dimensions[1] = 0
      player.line_segments = 0
      player.strings = 0
      resetUpgradesByGroup('line-seg');
      resetUpgradesByGroup('string');
      resetMilestonesByGroup('line');

      Resets.lines.reset();
    },
  },
}

export function doReset(id: string, force = false) {
  const R = Resets[id]

  if (force || Decimal.gte(temp.currencies[R.gain],1)) {
    if (id === 'shapes') {
      alert(`Coming soon!`)
      return;
    }

    const G = Currencies[R.gain]

    if (!force) {
      G.amount = Decimal.add(G.amount, temp.currencies[R.gain])
      R.onreset?.()
    }

    R.reset()

    resetTemp()
  }
}
