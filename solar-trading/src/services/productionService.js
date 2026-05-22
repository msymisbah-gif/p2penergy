/**
 * Production Service — Solar Energy Simulation Model
 *
 * Implements the PV production formula:
 *     P(t) = P_peak * eta * I(t) / I_STC
 *
 * Tuned for Ajdabiya, Libya (lat ≈ 30.75°N) — a high-irradiance,
 * arid coastal climate with strong summer peaks.
 */

/* ------------------------------------------------------------------ */
/*  Physical constants (thesis-defined)                               */
/* ------------------------------------------------------------------ */

export const SOLAR_CONSTANTS = Object.freeze({
  P_PEAK: 3.0,   // Installed peak power per home (kWp)
  ETA:    0.80,  // Overall system efficiency (80%)
  I_STC:  1.0,   // Standard Test Condition irradiance (kW/m²)
  I_MIN:  0.65,  // Min realistic instantaneous factor I(t)
  I_MAX:  0.95,  // Max realistic instantaneous factor I(t)

  AJDABIYA_PEAK_DOY:  172,  // Jun 21 — summer solstice
  SEASONAL_AMPLITUDE: 0.20, // ±20% seasonal swing
  SEASONAL_BASE:      0.95, // baseline multiplier
  SUNRISE_HOUR:       6,
  SUNSET_HOUR:        18,
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Day-of-year (1-366) for a given Date.
 */
export function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86_400_000);
}

/**
 * Seasonal factor for Ajdabiya — sinusoidal curve peaking on the
 * summer solstice (DOY 172) and bottoming on the winter solstice.
 * Returns a multiplier in roughly [0.75, 1.15].
 */
export function getSeasonalFactor(date = new Date()) {
  const { AJDABIYA_PEAK_DOY, SEASONAL_AMPLITUDE, SEASONAL_BASE } = SOLAR_CONSTANTS;
  const phase = ((dayOfYear(date) - AJDABIYA_PEAK_DOY) / 365) * 2 * Math.PI;
  return SEASONAL_BASE + SEASONAL_AMPLITUDE * Math.cos(phase);
}

/**
 * Hourly irradiance shape — a half-sine between sunrise and sunset,
 * 0 outside daylight hours.
 */
export function getHourlyShape(hour) {
  const { SUNRISE_HOUR, SUNSET_HOUR } = SOLAR_CONSTANTS;
  if (hour < SUNRISE_HOUR || hour > SUNSET_HOUR) return 0;
  const daylight = SUNSET_HOUR - SUNRISE_HOUR;
  return Math.sin(((hour - SUNRISE_HOUR) / daylight) * Math.PI);
}

/**
 * Random instantaneous irradiance factor I(t) in [I_MIN, I_MAX].
 */
export function randomIrradiance() {
  const { I_MIN, I_MAX } = SOLAR_CONSTANTS;
  return I_MIN + Math.random() * (I_MAX - I_MIN);
}

/* ------------------------------------------------------------------ */
/*  Core production formula                                           */
/* ------------------------------------------------------------------ */

/**
 * P(t) = P_peak * eta * I(t) / I_STC
 *
 * Returns instantaneous power (kW) given a Date. Combines:
 *   - random irradiance noise
 *   - seasonal factor
 *   - hourly daylight shape
 */
export function computeInstantaneousProduction(date = new Date()) {
  const { P_PEAK, ETA, I_STC } = SOLAR_CONSTANTS;

  const fractionalHour = date.getHours() + date.getMinutes() / 60;
  const I_t =
      randomIrradiance() *
      getSeasonalFactor(date) *
      getHourlyShape(fractionalHour);

  return (P_PEAK * ETA * I_t) / I_STC;
}

/**
 * Simulate total daily energy production (kWh) by sampling each hour
 * of the day. Each sample is power (kW) × 1 h = energy (kWh).
 */
export function simulateDailyProduction(date = new Date()) {
  let total = 0;
  for (let h = 0; h < 24; h++) {
    const sample = new Date(date);
    sample.setHours(h, 30, 0, 0); // midpoint of each hour
    total += computeInstantaneousProduction(sample);
  }
  return Number(total.toFixed(2));
}

/**
 * Plausible daily household consumption for the Ajdabiya simulation
 * (5–15 kWh/day per home).
 */
export function simulateDailyConsumption() {
  return Number((5 + Math.random() * 10).toFixed(2));
}

/**
 * Full daily simulation result for a home.
 */
export function simulateDay(date = new Date()) {
  const production  = simulateDailyProduction(date);
  const consumption = simulateDailyConsumption();
  const surplus     = Number(Math.max(0, production - consumption).toFixed(2));
  return { date, production, consumption, surplus };
}
