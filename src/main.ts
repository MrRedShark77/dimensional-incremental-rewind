import './assets/main.css'

import { createApp, reactive } from 'vue'
import App from './App.vue'
import { deepAssign, getSaveData, loadSave, save, type Save } from './utils/saving'
import { getTempData, loop, updateTemp, type Temp } from './update'
import { checkTab } from './data/tabs'

export const FPS = 30

export const player: Save = reactive(getSaveData()),
  temp: Temp = reactive(getTempData())

export function load() {
  deepAssign(player, loadSave());

  for (let i = 0; i < 10; i++) updateTemp();

  console.log('Hello, World!')

  checkTab()

  setInterval(() => {
    loop()
  }, 1000 / FPS)
  setInterval(() => {
    // save()
  }, 60000);
}

try {
  createApp(App).mount('#app')
} catch (error) {
  console.error(error)
}
