import { player } from "@/main"
import { format } from "@/utils/formats"
import { splitIntoGroups } from "@/utils/other"
import Decimal, { type DecimalSource } from "break_eternity.js"

export const Milestones: Record<string,{
  condition(): boolean

  title: string
  description: string
  value: DecimalSource

  previous?: string
  manual?: boolean

  [index: string]: unknown
}> = {
  'line\\1': {
    get value() { return 1 },

    get title() { return `<b>${format(this.value,0)}</b> Lines` },
    get description() { return `Unlock more dot upgrades.` },
    condition() { return Decimal.gte(player.dimensions[1], this.value) },
  },
  'line\\2': {
    previous: 'line\\1',
    get value() { return 2 },

    get title() { return `<b>${format(this.value,0)}</b> Lines` },
    get description() { return `Unlock Line Segments.` },
    condition() { return Decimal.gte(player.dimensions[1], this.value) },
  },
  'line\\3': {
    previous: 'line\\2',
    get value() { return 3 },

    get title() { return `<b>${format(this.value,0)}</b> Lines` },
    get description() { return `You always can buy max dots.` },
    condition() { return Decimal.gte(player.dimensions[1], this.value) },
  },
  'line\\4': {
    previous: 'line\\3',
    get value() { return 4 },

    get title() { return `<b>${format(this.value,0)}</b> Lines` },
    get description() { return `Automatically update dots.` },
    condition() { return Decimal.gte(player.dimensions[1], this.value) },
  },
  'line\\5': {
    previous: 'line\\4',
    get value() { return 5 },

    get title() { return `<b>${format(this.value,0)}</b> Lines` },
    get description() { return `Unlock String. You keep dot upgrades on Line reset.` },
    condition() { return Decimal.gte(player.dimensions[1], this.value) },
  },
  'line\\6': {
    previous: 'line\\5',
    get value() { return 6 },

    get title() { return `<b>${format(this.value,0)}</b> Lines` },
    get description() { return `Increase Line Segments cap by <b>1 second</b> worth of production per Lines.` },
    condition() { return Decimal.gte(player.dimensions[1], this.value) },
  },
  'line\\7': {
    previous: 'line\\6',
    get value() { return 10 },

    get title() { return `<b>${format(this.value,0)}pL</b> of String` },
    get description() { return `You can buy max line upgrades, they will no longer spent anything.` },
    condition() { return Decimal.gte(player.strings, this.value) },
  },
  'line\\8': {
    previous: 'line\\7',
    get value() { return 50 },

    get title() { return `<b>${format(this.value,0)}pL</b> of String` },
    get description() { return `You keep non-repeatable line upgrades on String reset.` },
    condition() { return Decimal.gte(player.strings, this.value) },
  },
  'line\\9': {
    previous: 'line\\8',
    get value() { return 1e4 },

    get title() { return `<b>${format(this.value,0)}pL</b> of String` },
    get description() { return `Unlock String upgrades.` },
    condition() { return Decimal.gte(player.strings, this.value) },
  },
  'line\\10': {
    previous: 'line\\9',
    get value() { return 11 },

    get title() { return `<b>${format(this.value,0)}</b> Lines` },
    get description() { return `Increase Line Segments gain by <b>Lines+10</b>, but Line Segments cap is always <b>1 second</b> worth of production.` },
    condition() { return Decimal.gte(player.dimensions[1], this.value) },
  },
  'line\\11': {
    previous: 'line\\10',
    get value() { return 270188 },

    get title() { return `<b>${format(this.value,0)}pL</b> of String` },
    get description() { return `Reduce the cost scaling of the 13th line upgrade.` },
    condition() { return Decimal.gte(player.strings, this.value) },
  },
  'line\\12': {
    previous: 'line\\11',
    get value() { return 20 },

    get title() { return `<b>${format(this.value,0)}</b> Lines` },
    get description() { return `Automatically update String.` },
    condition() { return Decimal.gte(player.dimensions[1], this.value) },
  },

  'shape\\1': {
    value: 1,

    get title() { return `<b>${format(this.value,0)}</b> Shapes` },
    get description() { return `Unlock Shape tree. You always can buy max dots and keep dot upgrades on Line reset.` },
    condition() { return Decimal.gte(player.dimensions[2], this.value) },
  },
  'shape\\2': {
    value: 2,

    get title() { return `<b>${format(this.value,0)}</b> Shapes` },
    get description() { return `Unlock Polygons. You always can buy max lines.` },
    condition() { return Decimal.gte(player.dimensions[2], this.value) },
  },
  'shape\\3': {
    value: 3,

    get title() { return `<b>${format(this.value,0)}</b> Shapes` },
    get description() { return `You keep line milestones on Shape reset. Multiply Polygons gain by <b>10^Shapes</b>.` },
    condition() { return Decimal.gte(player.dimensions[2], this.value) },
  },
  'shape\\4': {
    value: 4,

    get title() { return `<b>${format(this.value,0)}</b> Shapes` },
    get description() { return `Automatically update lines.` },
    condition() { return Decimal.gte(player.dimensions[2], this.value) },
  },
}

export const MilestoneKeys = Object.keys(Milestones)

export const MilestoneGroups: Record<string, string[]> = splitIntoGroups(MilestoneKeys)

export function resetMilestonesByGroup(group: string, keep: string[] = []) { for (const i of MilestoneGroups[group]) if (!keep.includes(i)) player.milestones[i] = false; }
export function checkMilestones(group: string) {
  for (const i of MilestoneGroups[group]) if (!player.milestones[i]) {
    const M = Milestones[i]
    if (!M.manual && M.condition()) player.milestones[i] = true;
  }
}
export const isMilestoneAchieved: (id: string) => boolean = id => player.milestones[id];
