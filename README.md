# ATMOCAST: Air Pollution–Weather Coupled Forecast

A production-grade atmospheric intelligence web application that couples real-time air quality metrics with meteorological dynamics to deliver high-resolution, short-term coupled forecasts.

**🎯 Problem:** SIH26082 — Air Pollution–Weather Coupled Forecast  
**🚀 Status:** Production Ready | Deployed & Tested  
**🌍 Repository:** https://github.com/NirmalSushil/SIH26082.git  

---

## 🌟 Key Features

* 📍 **Default Focus on Mumbai & Global Search:** Automatically initializes with real-time conditions for Mumbai, India, and allows searching any global city with instant autocomplete, Enter-key matching, and device GPS geolocation.
* ⭐️ **Favorite Places & Bookmarking:** Save and organize frequent locations with 1-click bookmarks stored locally for instant switching.
* 🧠 **Physics-Informed Meteorological Coupling:** Dynamic heuristic engine adjustments factor in:
  * **Wind Shear Dispersion:** Stagnant air accumulation vs high-velocity particulate dilution.
  * **Thermal Inversion Modeling:** Ground-level cold pools and high relative humidity trapping pollutants.
  * **Wet Scavenging:** Rain droplet scrubbing of PM2.5, PM10, and soluble gases.
  * **Photochemical Reactions:** High-temperature/solar radiation ozone spikes.
  * **Barometric Subsidence:** Anticyclonic high pressure capping.
* 📊 **Multi-Tab Interactive Analytics:**
  * **Coupled Forecast:** Raw sensor baseline vs weather-adjusted trajectory with EPA reference lines.
  * **Weather Drivers:** Correlated multi-axis plot of Temperature, Wind, Humidity, and Rain.
  * **Pollutant Breakdown:** Detailed curves for PM2.5, PM10, Ozone ($\text{O}_3$), and Nitrogen Dioxide ($\text{NO}_2$).
* 📋 **Full Pollutant Telemetry:** Live ground readings for PM2.5, PM10, $\text{O}_3$, $\text{NO}_2$, $\text{SO}_2$, and $\text{CO}$ with WHO guideline thresholds.
* ⏱️ **24-Hour Timeline Reel:** Horizontal scrollable hourly forecast strip with weather icons, temperatures, and color-coded AQI chips.
* 💡 **Contextual AI Insights & Health Guidance:** Plain-language atmospheric summaries, optimal workout time windows, sensitive group precautions, and window ventilation guidance.
* 🎨 **Clean Enterprise UI & Theme Switcher:** Clean default light (white) mode with full dark mode toggle and zero-flicker client synchronization.
* ⚡ **Zero Setup & Keyless API Resilience:** Powered by Open-Meteo APIs with built-in synthetic atmospheric fallback to guarantee 100% uptime.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.3 (App Router, Turbopack) + React 19 |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS v4 + Vanilla CSS Tokens |
| **Charts** | Recharts 3.10 (Composed Multi-Axis SVG Charts) |
| **Icons** | Lucide React |
| **Data Sources** | Open-Meteo Weather, Air Quality & Geocoding APIs |
| **Resilience** | Deterministic Synthetic Atmospheric Model Fallback |

---

## 📁 Project Structure

```
air-pollution-forecast/
├── app/
│   ├── api/
│   │   ├── forecast/route.ts   # Coupled forecast aggregation endpoint
│   │   └── geocode/route.ts    # Global city geocoding endpoint
│   ├── favicon.ico            # Favicon
│   ├── globals.css            # Tailwind v4 theme, tokens & utilities
│   ├── layout.tsx             # Root layout & theme script
│   └── page.tsx               # Main dashboard with bookmarks & state
├── components/
│   ├── current-conditions.tsx # Hero AQI card, bookmark button & pollutants
│   ├── coupling-breakdown.tsx # Factor delta diagnostics & optimal windows
│   ├── forecast-chart.tsx     # Multi-tab interactive Recharts dashboard
│   ├── hourly-timeline.tsx    # 24-hour horizontal hourly forecast reel
│   ├── insight-panel.tsx      # Natural language synthesis & health advisories
│   └── search-bar.tsx         # Autocomplete search, GPS & preset pills
├── lib/
│   ├── api-clients.ts         # Open-Meteo clients, world cities index & fallbacks
│   ├── forecast.ts            # Mathematical coupling engine & heuristics
│   ├── types.ts               # TypeScript data models & AQI scales
│   └── utils.ts               # Formatting, WMO weather codes & WHO thresholds
├── PROJECT_DOCUMENTATION.md   # Complete technical specifications & methodology
└── README.md                  # This file
```

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/NirmalSushil/SIH26082.git
cd air-pollution-forecast
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## ☁️ Deployment

This project is zero-config ready for **Vercel** or any Node.js hosting platform:
1. Push repository to GitHub.
2. Import repository into [Vercel](https://vercel.com).
3. Click **Deploy**. No API keys or environment secrets required.

---

## 📖 Complete Documentation

For the full scientific methodology, coupling mathematical formulations, API schemas, and architecture diagrams, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).
