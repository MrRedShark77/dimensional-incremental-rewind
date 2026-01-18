import { expPow, scale, simpleCost } from "@/utils/decimal";
import type { DecimalSource } from "break_eternity.js";
import { Currencies, Currency } from "./currencies";
import Decimal from "break_eternity.js";
import { player, temp } from "@/main";
import { splitIntoGroups } from "@/utils/other";
import { isMilestoneAchieved } from "./milestones";
import { formatMult } from "@/utils/formats";
import { Resets } from "./resets";

export const FabricCostRequirements: {
  require(x: DecimalSource): DecimalSource
  bulk(x: DecimalSource): DecimalSource
  currency: string
}[] = [
  {
    require: x => simpleCost(scale(x, 15, 2, 'ME2'), 'ES', 1e100, 1e90, 1e10),
    bulk: x => scale(simpleCost(x, 'ESI', 1e100, 1e90, 1e10), 15, 2, 'ME2', true).floor().add(1),
    currency: 'dots',
  },{
    require: x => simpleCost(x, 'E', 100, 10),
    bulk: x => simpleCost(x, 'EI', 100, 10).floor().add(1),
    currency: 'lines',
  },{
    require: x => simpleCost(x, 'E', 1, 2),
    bulk: x => simpleCost(x, 'EI', 1, 2).floor().add(1),
    currency: 'shapes',
  },
]

export function getFabrics(i: number) {
  const F = FabricCostRequirements[i], C = Currencies[F.currency as Currency]

  if (Decimal.gte(C.amount, F.require(player.total_fabrics[i]))) player.total_fabrics[i] = Decimal.add(player.total_fabrics[i], 1).max(F.bulk(C.amount));
}

export const ShapeTree: Record<string,{
  description: string

  condition(): boolean
  require?: [string, DecimalSource][]

  cost: DecimalSource

  effect?(): DecimalSource
  defaultEffect?: DecimalSource
  effectDisplay?(x: DecimalSource): string
}> = {
  '1-1': {
    condition: () => true,
    get description() { return `Improve dots gain better. (^2 ➜ <b>^1.96</b>)` },
    require: [
      ['shapes', 1],
    ],
    cost: 1,
  },

  '2-1': {
    condition: () => hasShapeTree('1-1'),
    get description() { return `The first and second line upgrades' softcap is weaker.` },
    cost: 2,
  },
  '2-2': {
    condition: () => hasShapeTree('1-1'),
    get description() { return `The seventh line upgrade's softcap is removed.` },
    cost: 2,
  },

  '3-1': {
    condition: () => hasShapeTree('2-1') || hasShapeTree('2-2'),
    get description() { return `Dots gain softcap is <b>5%</b> weaker again.` },
    require: [
      ['dots', 4.4e249],
    ],
    cost: 1,
  },

  '4-1': {
    condition: () => isMilestoneAchieved('shape\\2') && hasShapeTree('3-1'),
    get description() { return `Multiply Polygons gain and cap by <b>10</b>.` },
    cost: 3,
  },
  '4-2': {
    condition: () => isMilestoneAchieved('shape\\2') && hasShapeTree('3-1'),
    get description() { return `Add <b>1</b> to OoM of Line Segments to Polygons cap exponent.` },
    cost: 3,
  },
  '4-3': {
    condition: () => isMilestoneAchieved('shape\\2') && hasShapeTree('3-1'),
    get description() { return `Add <b>1</b> to Shapes to Polygons cap exponent.` },
    cost: 3,
  },

  '5-1': {
    condition: () => hasShapeTree('4-1') || hasShapeTree('4-2') || hasShapeTree('4-3'),
    get description() { return `String length softcap is <b>10%</b> weaker.` },
    require: [
      ['strings', '6.782e416'],
    ],
    cost: 5,
  },
  '5-2': {
    condition: () => hasShapeTree('5-1'),
    get description() { return `Polygons boost Dots gain at a reduced rate.` },
    cost: 35,
    effect() {
      return expPow(Decimal.add(player.polygons, 1), 6)
    },
    defaultEffect: 1,
    effectDisplay: x => formatMult(x),
  },
}

export const ShapeTreeKeys = Object.keys(ShapeTree)
export const ShapeTreeDepth = splitIntoGroups(ShapeTreeKeys, '-')

export function hasShapeTree(id: string) : boolean { return player.shape_tree[id] }
export function getShapeTreeEffect(id: string) { return player.shape_tree[id] ? temp.shape_tree_effect[id] : ShapeTree[id].defaultEffect ?? 1 }

export function purchaseShapeTree(id: string) {
  const U = ShapeTree[id]

  if (player.shape_tree[id] || !(U.condition?.() ?? true)) return;

  if (Decimal.gte(Currencies.fabrics.amount, U.cost) && (U.require?.every(([x,y]) => Decimal.gte(Currencies[x as Currency].amount, y)) ?? true)) {
    player.spent_fabrics = Decimal.add(player.spent_fabrics, U.cost)
    player.shape_tree[id] = true
  }
}

export function respecShapeTree() {
  if (confirm("Are you sure you want to respec Shape Tree? It will force Shape reset.")) {
    player.spent_fabrics = 0;

    for (const id of ShapeTreeKeys) player.shape_tree[id] = false;

    Resets.shapes.reset();
  }
}
