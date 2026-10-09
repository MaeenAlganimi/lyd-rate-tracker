import Decimal from "decimal.js";

import { toRateString } from "@/lib/rates/decimal";

export type Spread = {
  absolute: string;
  percent: string;
};

export function spread(official: string, parallel: string): Spread | null {
  const base = new Decimal(official);
  if (!base.isFinite() || base.isZero()) return null;
  const gap = new Decimal(parallel).minus(base);
  return {
    absolute: toRateString(gap),
    percent: gap.div(base).times(100).toFixed(4),
  };
}
