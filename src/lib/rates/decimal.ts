import Decimal from "decimal.js";

export const RATE_SCALE = 6;

export function toRateString(value: Decimal.Value, scale = RATE_SCALE): string {
  return new Decimal(value).toFixed(scale);
}

export function divideRates(numerator: string, denominator: string, scale = RATE_SCALE): string {
  const divisor = new Decimal(denominator);
  if (divisor.isZero()) {
    throw new Error("Cannot divide a rate by zero.");
  }
  return new Decimal(numerator).div(divisor).toFixed(scale);
}

export function invertRate(lydPerUnit: string, scale = RATE_SCALE): string {
  return divideRates("1", lydPerUnit, scale);
}

export function isPositiveRate(value: string): boolean {
  try {
    const decimal = new Decimal(value);
    return decimal.isFinite() && decimal.gt(0);
  } catch {
    return false;
  }
}
