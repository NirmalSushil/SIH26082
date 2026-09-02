# Air Pollution–Weather Coupled Forecast (ATMOCAST)
### Project Documentation & Technical Specification
**Problem Code:** SIH26082  
**Platform:** Next.js 16 (App Router) • TypeScript • Tailwind CSS • Recharts • Open-Meteo APIs  
**Default Configuration:** Light Mode Theme • Default City: Mumbai, Maharashtra, India  

---

## 1. Executive Summary & Overview

**ATMOCAST** is a production-grade atmospheric intelligence platform designed to address **SIH26082**. It integrates real-time air quality metrics with meteorological dynamics to deliver high-resolution, short-term coupled forecasts.

Traditional Air Quality Index (AQI) forecasts often treat chemical concentrations in isolation from microclimatic variations. ATMOCAST closes this gap by implementing a **physics-informed weather-pollution coupling heuristic engine**. It continuously factors in wind dispersion, boundary layer thermal inversions, precipitation wet deposition, and barometric pressure subsidence to predict how atmospheric conditions will alter air quality hour by hour.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              ATMOCAST PIPELINE                               │
│                                                                              │
│   [ Open-Meteo Air Quality ] ──┐                                             │
│   (PM2.5, PM10, O₃, NO₂, etc)  │                                             │
│                                ├──► [ Coupling Heuristic Engine ] ─────────┐ │
│   [ Open-Meteo Meteorology ]  │    • Wind Dispersion & Stagnation        │ │
│   (Wind, Temp, Humidity, Rain) ┘    • Boundary Thermal Inversions          │ │
│                                     • Precipitation Wet Scavenging         │ │
│                                     • Barometric Pressure Trends           │ │
│                                                                            │ │
│   ┌────────────────────────────────────────────────────────────────────────┘ │
│   ▼                                                                          │
│   [ Coupled Forecast Payload ] ──► [ Interactive Analytical Dashboard ]      │
│   • Adjusted AQI vs Raw AQI        • Hero AQI & Pollutant Spectrum           │
│   • Factor Impact Breakdown         • Multi-Tab Analytical Charts            │
│   • Contextual AI Insights          • Health & Outdoor Activity Advisories   │
│   • Bookmark / Favorites System     • 24-Hour Timeline Reel                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Problem Statement

### The Challenge
Air pollution is not static; it is heavily influenced by meteorological conditions. Standard air quality monitoring presents two critical limitations:
1. **Static Lag:** Ground sensors record historical or current concentration, but cannot anticipate how sudden meteorological shifts (e.g., dying wind, nocturnal cold pools, or approaching rain) will alter pollutant dispersion.
2. **Decoupled Predictions:** Standalone chemical transport models are computationally heavy, while simple weather apps ignore aerosol dynamics entirely. 

### Core Questions Addressed
* *Why does AQI surge on cold, still winter nights despite identical factory/traffic emissions?* (Answer: **Thermal inversion trapping**).
* *Why does air clear rapidly during an afternoon breeze or light shower?* (Answer: **Convective turbulence & wet scavenging**).
* *When is the safest window for citizens to exercise outdoors or ventilate homes?* (Answer: **Hourly coupled dispersion forecasting**).

---

## 3. How the Problem is Solved: Meteorological Coupling Heuristics

The core innovation is our **Atmospheric Coupling Engine (`lib/forecast.ts`)**. For every forecast hour $t$, the system computes a multi-factor numerical adjustment ($\Delta AQI$) to standard baseline chemical transport data:

$$\text{Coupled AQI}_t = \max\left(5, \text{Raw AQI}_t + \Delta_{\text{wind}} + \Delta_{\text{stability}} + \Delta_{\text{precip}} + \Delta_{\text{photochem}} + \Delta_{\text{pressure}}\right)$$

### 1. Wind Shear & Horizontal Advection ($\Delta_{\text{wind}}$)
Wind speed and gusts govern horizontal ventilation:
* **Calm / Stagnant ($<3\text{ km/h}$):** $+10\text{ AQI}$ (severe pollutant accumulation).
* **Light Breeze ($3 - 7\text{ km/h}$):** $+4\text{ AQI}$ (insufficient dispersion).
* **Moderate Mixing ($7 - 14\text{ km/h}$):** $0\text{ AQI}$ (baseline balance).
* **Strong Dispersion ($14 - 22\text{ km/h}$):** $-5\text{ AQI}$ (active ventilation).
* **High Velocity ($>22\text{ km/h}$):** $-9\text{ to }-12\text{ AQI}$ (rapid dilution of fine particulates).

### 2. Boundary Layer Dynamics & Thermal Inversion ($\Delta_{\text{stability}}$)
Nocturnal surface cooling coupled with high humidity traps pollutants within a thin boundary layer:
* **Severe Ground Inversion ($T < 5^\circ\text{C}, \text{RH} > 85\%$):** $+9\text{ AQI}$.
* **Moderate Inversion ($T < 12^\circ\text{C}, \text{RH} > 75\%$):** $+5\text{ AQI}$.
* **Strong Convective Updrafts ($T > 22^\circ\text{C}, \text{RH} < 40\%$):** $-4\text{ AQI}$ (effective vertical mixing).

### 3. Precipitation Washout / Wet Deposition ($\Delta_{\text{precip}}$)
Rain droplets scour suspended aerosols (PM2.5, PM10) and soluble gases ($\text{SO}_2, \text{NO}_2$):
* **Heavy Rainfall ($\ge 5.0\text{ mm}$):** $-18\text{ AQI}$.
* **Moderate Rain ($2.0 - 5.0\text{ mm}$):** $-11\text{ AQI}$.
* **Light Rain ($0.5 - 2.0\text{ mm}$):** $-6\text{ AQI}$.

### 4. Photochemical Ozone Reactions ($\Delta_{\text{photochem}}$)
* **High Heat & Solar Irradiance ($T > 28^\circ\text{C}, \text{RH } 35-65\%$):** $+6\text{ AQI}$ due to accelerated secondary ground-level ozone ($\text{O}_3$) production.

### 5. Barometric Pressure & Anticyclonic Subsidence ($\Delta_{\text{pressure}}$)
* **Anticyclonic High ($P > 1022\text{ hPa}$):** $+3\text{ AQI}$ (downward subsidence suppresses plume rise).
* **Low Pressure Front ($P < 1006\text{ hPa}$):** $-3\text{ AQI}$ (turbulent updrafts).

---

## 4. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.3.4 (App Router)** | Fullstack React framework with Turbopack, Server-Side API routes, and static route optimization. |
| **Language** | **TypeScript 5 (Strict Mode)** | End-to-end type safety across API clients, data contracts, and component props. |
| **UI & Styling** | **Tailwind CSS v4 + Vanilla CSS** | Enterprise design tokens, default light theme with dark mode toggle, and responsive layout. |
| **Data Visualization** | **Recharts 3.10** | Interactive, composed multi-axis atmospheric charts with custom HTML5 tooltips and reference bands. |
| **Icons & Assets** | **Lucide React** | Lightweight iconography for weather conditions, pollutant badges, and bookmarks. |
| **Data Sources** | **Open-Meteo APIs** | Global, keyless, high-frequency hourly weather forecasts, air quality chemical data, and geocoding. |
| **Resilience Layer** | **Synthetic Atmospheric Engine** | Built-in fallback generating physical diurnal models if external endpoints encounter transient timeouts. |

---

## 5. Key System Features

### 1. Default Focus on Mumbai & Precision Global Search
* **Default City:** Automatically initializes with real-time conditions for Mumbai, Maharashtra, India.
* **Instant Typeahead & Autocomplete:** Debounced query matching global cities.
* **Instant Enter Resolution:** Direct keyboard entry immediately triggers geocoding and forecast retrieval.
* **Built-in Global City Index:** Instant, zero-latency lookup for 30+ major world metropolitan centers.
* **Browser GPS Integration:** 1-click device geolocation for instant local atmospheric analysis.

### 2. Favorite Places / Bookmarking System
* **1-Click Bookmark Action:** Save any city with a dedicated bookmark toggle button.
* **Persistent Favorites Strip:** Dedicated quick-access chip strip in the control bar for instant switching between favorite locations.

### 3. Real-Time Current Conditions Deck
* **Dynamic Hero AQI Card:** Visualizes coupled AQI against raw baseline with severity color coding (US EPA Standard).
* **Full Pollutant Spectrum:** Dedicated telemetry for PM2.5, PM10, Ground Ozone ($\text{O}_3$), Nitrogen Dioxide ($\text{NO}_2$), Sulphur Dioxide ($\text{SO}_2$), and Carbon Monoxide ($\text{CO}$) with WHO standard benchmarks.
* **Atmospheric Variables:** Live ambient temperature, apparent feels-like temperature, wind velocity & gusts, relative humidity, barometric pressure, and precipitation.

### 4. Multi-Tab Analytical Forecast Dashboard
* **Tab 1 — AQI Coupling Comparison:** Dual-series area/line charts contrasting Raw AQI vs Weather-Adjusted AQI over 12h, 24h, and 48h windows with wind velocity overlays and EPA threshold reference lines.
* **Tab 2 — Meteorological Drivers:** Correlated multi-axis plot of Temperature, Wind Speed, Relative Humidity, and Precipitation.
* **Tab 3 — Pollutant Breakdown:** Detailed individual concentration curves for PM2.5, PM10, $\text{O}_3$, and $\text{NO}_2$.

### 5. Meteorological Coupling Diagnostics
* **Factor Impact Cards:** Numerical delta indicators detailing exact contributions (+/- AQI points) from Wind Dispersion, Rain Scavenging, Thermal Inversions, and Barometric Pressure.
* **Optimal Activity Window:** Identifies the exact hour with lowest predicted pollution for outdoor exercise.
* **Peak Pollution Alert:** Identifies periods of maximum diurnal stagnation and traffic emission accumulation.

### 6. 24-Hour Timeline Reel
* Smooth, horizontal scrollable hourly reel with weather condition icons, temperatures, and color-coded AQI chips.

### 7. Actionable Health & Lifestyle Guidance
* Tailored advisory cards for **Outdoor Exercise**, **Vulnerable / Sensitive Groups**, and **Home Ventilation**.

### 8. Enterprise Theme Architecture
* Default light (white) mode with full dark mode toggle and persistent client-side `localStorage` caching.

---

## 6. API Architecture & Data Contracts

### 1. `/api/geocode` (POST)
Converts human-readable city names into geographic coordinates with offline fallback.
```json
// Request
{
  "query": "Mumbai"
}

// Response
{
  "success": true,
  "data": [
    {
      "id": 1275339,
      "name": "Mumbai",
      "latitude": 19.076,
      "longitude": 72.8777,
      "country": "India",
      "admin1": "Maharashtra",
      "displayName": "Mumbai, Maharashtra, India"
    }
  ],
  "timestamp": "2026-09-02T09:30:00.000Z"
}
```

### 2. `/api/forecast` (POST)
Fetches weather and air quality observations, applies the coupling heuristics, and returns the unified forecast payload.
```json
// Request
{
  "latitude": 19.076,
  "longitude": 72.8777,
  "cityName": "Mumbai",
  "country": "India"
}
```

---

## 7. Quick Start & Deployment Guide

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Production build & run
npm run build
npm start
```
*Access dashboard:* **`http://localhost:3000`**
