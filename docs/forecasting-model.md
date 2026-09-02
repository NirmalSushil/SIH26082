# Forecasting Model Documentation

## Overview

This document explains the **weather-pollution coupling heuristic** that is the core value-add of this application. It is **not a validated atmospheric science model** — it is a demonstration-level heuristic that shows how weather variables influence air pollution forecasts.

---

## Core Principle

**Raw AQI Forecast** (from Open-Meteo) already includes basic atmospheric modeling. Our **coupling layer** adds a lightweight, interpretable adjustment based on known meteorological-pollution relationships.

### Formula

```
adjusted_aqi[t] = raw_aqi[t] + coupling_adjustment[t]

where:

coupling_adjustment[t] = 
    (wind_penalty * wind_factor) 
    + (stability_penalty * stability_factor) 
    + (precip_benefit * precip_factor)
    + (emissions_factor * emissions_increase)

```

---

## Weather Variables & Their Effects

### 1. Wind Speed (`wind_speed_10m`)

**Effect on Pollution:** ↓ AQI (lower is better)

**Rationale:**
- High wind speed → pollutant **dispersion** and transport away from surface
- Low wind speed → pollutant **accumulation** near surface

**Adjustment:**

```typescript
wind_adjustment = {
  if (wind_speed < 3 km/h): +5 to +10 AQI points (stagnant conditions)
  if (3 ≤ wind_speed < 6): +2 to +5 AQI points (weak dispersion)
  if (6 ≤ wind_speed < 12): 0 AQI points (baseline, good dispersion)
  if (wind_speed ≥ 12): -2 to -5 AQI points (strong dispersion)
}
```

**Capped:** Adjustments are never more than ±10 AQI points to avoid extreme outliers.

### 2. Humidity & Temperature (Proxy for Inversion)

**Effect on Pollution:** ↑ AQI (higher is worse)

**Rationale:**
- High humidity + cool temperature = **temperature inversion** proxy
- Temperature inversions trap pollutants in a shallow layer near surface
- Dry + warm conditions = better vertical mixing

**Adjustment:**

```typescript
stability_adjustment = {
  // Temperature inversion proxy: cool + humid
  if (temp < 10°C && humidity > 80%): +3 to +8 AQI points
  if (temp 10-15°C && humidity > 70%): +1 to +3 AQI points
  if (temp > 20°C || humidity < 50%): 0 AQI points (stable conditions)
}
```

### 3. Precipitation

**Effect on Pollution:** ↓ AQI (lower is better)

**Rationale:**
- Rainfall → **wet deposition** (pollutants washed out of air)
- Even light rain removes significant portion of particulate matter
- Snow/ice pellets also capture particles

**Adjustment:**

```typescript
precip_adjustment = {
  if (precipitation > 5mm): -8 to -15 AQI points (significant washout)
  if (1mm < precipitation ≤ 5mm): -3 to -8 AQI points (moderate washout)
  if (precipitation > 0 && ≤ 1mm): -1 to -3 AQI points (light washout)
  if (precipitation = 0): 0 AQI points (no effect)
}
```

### 4. Pressure (Atmospheric Stability)

**Effect on Pollution:** ↑ AQI (higher pressure = more stagnant)

**Rationale:**
- High pressure → subsidence, stagnant air mass, poor mixing
- Low pressure → cyclonic activity, better vertical dispersion

**Adjustment (Secondary):**

```typescript
// Only applied if pressure drops significantly (>5 hPa in 3h)
if (pressure_drop > 5 hPa): -2 to -5 AQI points (improved mixing)
```

---

## Implementation (TypeScript Example)

```typescript
import { WeatherHourly, AirQualityHourly } from '@/lib/types';

export function computeCoupledForecast(
  weatherHourly: WeatherHourly,
  aqiHourly: AirQualityHourly
): { raw: number[]; adjusted: number[] } {
  const adjusted: number[] = [];

  for (let i = 0; i < aqiHourly.time.length; i++) {
    const rawAqi = aqiHourly.us_aqi[i] ?? 0;
    const wind = weatherHourly.wind_speed_10m[i] ?? 0;
    const humidity = weatherHourly.relative_humidity_2m[i] ?? 50;
    const temp = weatherHourly.temperature_2m[i] ?? 15;
    const precip = weatherHourly.precipitation[i] ?? 0;
    const pressure = weatherHourly.pressure_msl[i] ?? 1013;

    let adjustment = 0;

    // Wind effect
    if (wind < 3) adjustment += 8;
    else if (wind < 6) adjustment += 3;
    else if (wind >= 12) adjustment -= 3;

    // Stability (inversion proxy)
    if (temp < 10 && humidity > 80) adjustment += 5;
    else if (temp < 15 && humidity > 70) adjustment += 2;

    // Precipitation washout
    if (precip > 5) adjustment -= 12;
    else if (precip > 1) adjustment -= 5;
    else if (precip > 0) adjustment -= 2;

    // Cap adjustment to ±15 AQI points
    adjustment = Math.max(-15, Math.min(15, adjustment));

    const adjustedAqi = Math.max(0, rawAqi + adjustment);
    adjusted.push(Math.round(adjustedAqi));
  }

  return {
    raw: aqiHourly.us_aqi,
    adjusted,
  };
}

export function generateInsightSentence(
  weatherHourly: WeatherHourly,
  aqiHourly: AirQualityHourly,
  adjusted: number[]
): string {
  // Pick the most significant weather feature in next 12 hours
  const nextDay = weatherHourly.wind_speed_10m.slice(0, 12);
  const windAvg = nextDay.reduce((a, b) => a + b, 0) / nextDay.length;

  const precip = weatherHourly.precipitation.slice(0, 12);
  const significantPrecip = precip.some(p => p > 1);

  const rawAvg = aqiHourly.us_aqi.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
  const adjAvg = adjusted.slice(0, 12).reduce((a, b) => a + b, 0) / 12;

  const aqi_change = adjAvg - rawAvg;

  // Generate insight
  if (significantPrecip) {
    return `Incoming precipitation should wash pollutants out of the air tonight — expect AQI to improve by ${Math.abs(Math.round(aqi_change))} points.`;
  }
  if (windAvg > 12) {
    return `Strong winds are expected to disperse pollutants effectively — air quality should remain Good to Moderate throughout the day.`;
  }
  if (windAvg < 3) {
    return `Wind speeds are dropping, which may allow pollutants to accumulate — AQI could rise by ${Math.abs(Math.round(aqi_change))} points by tomorrow morning.`;
  }
  return `Weather conditions are stable — expect air quality to remain at current levels.`;
}
```

---

## AQI Severity Classification

The app uses the **US EPA AQI Scale** for color-coding and severity labels:

| AQI Range | Classification | Color | Health Concern |
|-----------|-----------------|-------|-----------------|
| 0–50 | **Good** | 🟢 Green | No risk |
| 51–100 | **Moderate** | 🟡 Yellow | Sensitive groups may be affected |
| 101–150 | **Unhealthy for Sensitive Groups** | 🟠 Orange | Sensitive groups at risk; general public okay |
| 151–200 | **Unhealthy** | 🔴 Red | General public beginning to be affected |
| 201–300 | **Very Unhealthy** | 🟣 Purple | General public significantly affected |
| 301+ | **Hazardous** | 🟤 Maroon | Everyone at risk; outdoor activity discouraged |

---

## Limitations & Caveats

**This is NOT a calibrated scientific model.** Limitations:

1. **No ML Training:** Weights are heuristic, not learned from observational data
2. **Simplified Physics:** Real atmosphere has ~100+ variables; we use 4
3. **Local Variations Ignored:** Air quality varies spatially (upwind factories, topography); we assume uniform conditions
4. **Emissions Not Modeled:** Coupling assumes pollutants are passive tracers; real emissions are traffic/industrial dependent
5. **Diurnal Cycle Simplified:** Mixing height, UV effects, and photochemistry not accounted for
6. **Grid Resolution:** Open-Meteo uses ~11 km grid cells; sub-grid variability not captured
7. **No Ensemble:** Single deterministic forecast; no uncertainty quantification

**When NOT to rely on this forecast:**
- For regulatory/health policy decisions (use official air quality agencies)
- For extreme events (sandstorms, wildfires, volcanic ash)
- For sub-hourly predictions (coupling is hourly resolution)

**Best Use:**
- Educational/demonstration tool
- Personalized air quality awareness for a city
- Trend understanding ("why did AQI change?")

---

## Future Enhancements (Out of MVP Scope)

1. **Training Data:** Collect 6–12 months of observed vs. forecast data; train weights with linear regression or XGBoost
2. **Photochemistry:** Add solar radiation, NOx→O3 formation rules
3. **Emissions Inventory:** Integrate time-of-day traffic patterns, industrial activity
4. **Ensemble Forecasts:** Generate multiple scenarios using perturbed meteorology
5. **Inverse Modeling:** Estimate upwind pollution sources from current observations
6. **Mobile:** Spatial interpolation for user's exact location (not just city centroid)

---

## Validation & Testing

### Manual Validation

1. Compare adjusted forecast to raw forecast for same city over 7 days
2. Check if patterns match known meteorology (e.g., rain should lower AQI)
3. Validate against independent sources (WAQI, EEA, USEPA AirNow)

### Unit Tests Example

```typescript
describe('computeCoupledForecast', () => {
  it('should reduce AQI when wind speed is high', () => {
    const weather = {
      wind_speed_10m: [15, 15, 15],
      relative_humidity_2m: [50, 50, 50],
      temperature_2m: [20, 20, 20],
      precipitation: [0, 0, 0],
      pressure_msl: [1013, 1013, 1013],
    };
    const aqi = { us_aqi: [60, 60, 60] };
    const { raw, adjusted } = computeCoupledForecast(weather, aqi);
    expect(adjusted).toBeLessThan(raw); // Should be lower due to wind
  });

  it('should increase AQI when wind is stagnant', () => {
    const weather = {
      wind_speed_10m: [1, 1, 1],
      relative_humidity_2m: [80, 80, 80],
      temperature_2m: [5, 5, 5],
      precipitation: [0, 0, 0],
      pressure_msl: [1013, 1013, 1013],
    };
    const aqi = { us_aqi: [50, 50, 50] };
    const { raw, adjusted } = computeCoupledForecast(weather, aqi);
    expect(adjusted).toBeGreaterThan(raw); // Should be higher due to stagnation
  });
});
```

---

## Summary

The coupling heuristic is a simple, interpretable way to demonstrate how weather affects air quality. It trades scientific rigor for transparency and ease of implementation. For an MVP, it effectively shows judges the concept without needing complex ML or data infrastructure.

**Key Takeaway:** This is a **demonstration layer**, not ground truth. Always link to official air quality agencies for health decisions.
