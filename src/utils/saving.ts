import { MilestoneKeys } from '@/data/milestones';
import { checkTab } from '@/data/tabs';
import { UpgradeKeys } from '@/data/upgrades'
import { player } from '@/main';
import { resetTemp, updateTemp } from '@/update';
import type { DecimalSource } from 'break_eternity.js'
import { toRaw } from 'vue';

const LOCALSTORAGE_NAME = "dim-inc-rewind-save";

export type Save = {
  points: DecimalSource

  dimensionShift: DecimalSource
  dimensions: DecimalSource[]
  line_segments: DecimalSource
  strings: DecimalSource

  upgrades: Record<string, DecimalSource>
  discovered_upgrades: Record<string, boolean>
  milestones: Record<string, boolean>

  tab: number
  stab: number[]

  options: {
    notation: number
    font: number
  }
}

export function getSaveData(): Save {
  const s: Save = {
    points: 1,

    dimensionShift: -1,
    dimensions: [0,0,0],
    line_segments: 0,
    strings: 0,

    upgrades: {},
    discovered_upgrades: {},
    milestones: {},

    tab: 0,
    stab: [],

    options: {
      notation: 2,
      font: 0,
    },
  }

  for (const id of UpgradeKeys) {
    s.upgrades[id] = 0;
    s.discovered_upgrades[id] = false;
  }
  for (const id of MilestoneKeys) s.milestones[id] = false;

  return s
}

type DeepObject = { [index: string | number]: unknown }
export function deepAssign(target: DeepObject, data: DeepObject) {
  for (const [k, v] of Object.entries(data)) {
    if (target[k] === undefined) target[k] = v
    else if (v !== null && typeof v === 'object')
      deepAssign(target[k] as DeepObject, v as DeepObject)
    else if (v !== undefined) target[k] = v
  }
}

export function loadSave(): Save {
  const data = localStorage.getItem(LOCALSTORAGE_NAME);

  if (data === null) return getSaveData();
  else {
    try {
      return JSON.parse(atob(data));
    } catch (e) {
      throw e;
    }
  }
}

export function save() {
  localStorage.setItem(LOCALSTORAGE_NAME, btoa(JSON.stringify(toRaw(player))));

  console.log("Game Saved!")
}

export function copySave() {
  const str = btoa(JSON.stringify(toRaw(player)))
  const copyText = document.getElementById('copy') as HTMLInputElement
  copyText.value = str
  copyText.style.visibility = "visible"
  copyText.select();
  document.execCommand("copy");
  copyText.style.visibility = "hidden"
}

export function saveFile() {
  const str = btoa(JSON.stringify(toRaw(player)))
  const file = new Blob([str], {type: "text/plain"})
  window.URL = window.URL || window.webkitURL;
  const a = document.createElement("a")
  a.href = window.URL.createObjectURL(file)
  a.download = "DIR - "+new Date().toString()+".txt"
  a.click()
}

function attemptImport(data: string | null) {
  if (data != null) {
    try {
      const new_player = getSaveData()
      deepAssign(new_player, JSON.parse(atob(data)))
      deepAssign(player, new_player);

      checkTab()

      resetTemp()
      for (let i = 0; i < 10; i++) updateTemp();
    } catch (error) {
      throw error
    }
  }
}

export function importy_file() {
  const a = document.createElement("input")
  a.setAttribute("type","file")
  a.click()
  a.onchange = ()=>{
    const fr = new FileReader();
    fr.onload = () => {
      attemptImport(fr.result as string)
      /*
      if (findNaN(loadgame, true)) {
        error("Error Importing, because it got NaNed")
        return
      }
      */
    }
    fr.readAsText(a.files![0]);
  }
}

export function importy() {
  const data = prompt("Paste in your save");

  attemptImport(data)
}

export function wipe() {
  if(confirm(`Are you sure you want to wipe your save?`)) {
    deepAssign(player, getSaveData())

    checkTab()

    resetTemp()
    for (let i = 0; i < 10; i++) updateTemp();
  }
}
