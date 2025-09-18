import { D, expPow, scale, scaleAll, simpleCost, softcap, sumBase } from './utils/decimal';
import type { DecimalSource } from 'break_eternity.js';
import Decimal from 'break_eternity.js';
import { copySave, save, type Save } from './utils/saving';
import { player, temp } from './main';
import { calc } from './update';

declare global {
    interface Window {
        player: Save;
        D: (x: DecimalSource) => Decimal;
        Decimal: unknown;

        formulas: Record<string, unknown>;

        dev: Record<string, unknown>;
    }
}

if (import.meta.env.DEV) {
  window.player = player;
  window.D = D;
  window.Decimal = Decimal;

  window.formulas = {
    softcap, scale, scaleAll, expPow, sumBase, simpleCost
  }

  window.dev = {
    save, calc, temp, copySave,
  }
}
