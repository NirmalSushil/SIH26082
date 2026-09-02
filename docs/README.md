# Air Pollution–Weather Coupled Forecast

## Project Overview

A production-grade web application that combines real-time air quality index (AQI) and weather data to deliver a coupled short-term forecast showing how weather conditions influence pollution levels.

**Problem Statement:** SIH26082 — Air Pollution–Weather Coupled Forecast

### MVP Scope

- **Core feature:** Live AQI and weather data retrieval for any user-searched or geolocated city
- **Forecasting:** 12–24 hour coupled forecast using a lightweight heuristic model
- **Visualization:** Interactive time-series chart showing raw AQI forecast vs. weather-adjusted forecast
- **UX:** Clean dashboard with current conditions, severity indicators, and plain-language insights
- **Deployment:** Free-tier Vercel with zero required API secrets

### Out of Scope

- User accounts and authentication
- Historical data warehousing
- Mobile-native apps
- Multi-language support
- Payment or advanced analytics

---

## Quick Links

- [Architecture & System Design](./architecture.md)
- [API Integration Guide](./api-integration.md)
- [Forecasting Model Documentation](./forecasting-model.md)
- [Local Setup Instructions](./setup.md)
- [Deployment Guide](./deployment.md)

---

## Key Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16+ (App Router) + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Charts** | Recharts (composed charts) |
| **State** | React Query / SWR + RSC |
| **Icons** | lucide-react |
| **Deployment** | Vercel (free tier) |

---

## Data Sources (Free, No Signup)

| Data | API | Endpoint |
|------|-----|----------|
| **Weather (current + hourly forecast)** | Open-Meteo | `https://api.open-meteo.com` |
| **Geocoding (city name → lat/lon)** | Open-Meteo Geocoding | `https://geocoding-api.open-meteo.com` |
| **Air Quality (current + forecast)** | Open-Meteo Air Quality | `https://air-quality-api.open-meteo.com` |

All APIs are completely free with no API keys required.

---

## Development Workflow

```
1. Install dependencies
   npm install

2. Start dev server
   npm run dev
   # Visit http://localhost:3000

3. Build for production
   npm run build
   npm start

4. Deploy to Vercel
   git push
   # Auto-deploys from Vercel dashboard
```

---

## Project Structure

```
air-pollution-forecast/
├── docs/
│   ├── README.md (this file)
│   ├── architecture.md
│   ├── api-integration.md
│   ├── forecasting-model.md
│   ├── setup.md
│   └── deployment.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/
│   ├── components/
│   │   ├── search-bar.tsx
│   │   ├── current-conditions.tsx
│   │   ├── forecast-chart.tsx
│   │   └── insight-panel.tsx
│   ├── lib/
│   │   ├── api-clients.ts
│   │   ├── forecast.ts
│   │   └── types.ts
│   └── styles/
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md (root)
```

---

## Definition of Done

✅ All acceptance criteria must be met before release:

- [ ] Live URL works for arbitrary city searches, not just hardcoded demo
- [ ] Chart shows both raw and weather-adjusted AQI forecasts on same timeline
- [ ] At least one dynamically generated plain-language insight sentence
- [ ] No API keys committed to repo; `.env.example` present for optional keys
- [ ] All API calls have visible loading and error states
- [ ] Complete `/docs` folder matching what was actually built
- [ ] UI has no default unstyled elements; responsive 375px+ mobile viewport
- [ ] Root README lets a stranger clone, run, and understand in <5 minutes

---

## Contact & Questions

For questions about this project, refer to the detailed documentation in `/docs` or review the inline code comments.
