# Architecture & System Design

## System Overview

The Air Pollution–Weather Coupled Forecast application follows a client-server architecture with three primary data flows:

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React App (Next.js App Router)                          │   │
│  │  ├─ Search Bar / Geolocation                             │   │
│  │  ├─ Current Conditions Cards                             │   │
│  │  ├─ Forecast Chart (Recharts)                            │   │
│  │  └─ Insight Panel (plain-language)                       │   │
│  └──────────────┬───────────────────────────────────────────┘   │
└─────────────────┼──────────────────────────────────────────────┘
                  │
                  │ HTTP Fetch (browser or RSC)
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              Next.js Server & API Routes                         │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  /api/geocode        → Open-Meteo Geocoding            │     │
│  │  /api/forecast       → Aggregates all data sources     │     │
│  │  (optional /api/waqi → WAQI fallback)                  │     │
│  └────────────┬──────────────────────┬────────────────────┘     │
└───────────────┼──────────────────────┼─────────────────────────┘
                │                      │
        ┌───────▼──────────┐   ┌──────▼────────────┐
        │ Open-Meteo APIs  │   │ Coupling Function │
        │ ├─ Geocoding     │   │ (Backend compute) │
        │ ├─ Weather       │   │                   │
        │ └─ Air Quality   │   │ Adjustment layer: │
        │                  │   │ • Wind speed      │
        └──────────────────┘   │ • Humidity        │
                               │ • Temperature     │
                               │ • Precipitation   │
                               └───────────────────┘
```

---

## Component Breakdown

### Pages

**`src/app/page.tsx`** — Main dashboard
- Orchestrates all child components
- Manages city search state and geolocation
- Fetches forecast data on city change
- Handles error boundaries and loading states

### Components

**`SearchBar.tsx`**
- Text input + geolocation button
- Debounced geocoding lookup
- Suggestions dropdown
- Accessibility: keyboard nav, ARIA labels

**`CurrentConditions.tsx`**
- Displays current AQI (with color-coded severity badge)
- Current temperature, wind, humidity, pressure
- Uses standard AQI breakpoints (Good/Moderate/Unhealthy/Hazardous)
- Responsive grid layout (1 col mobile → 4 cols desktop)

**`ForecastChart.tsx`**
- Recharts composed chart with multiple data series:
  - Line for raw AQI forecast (from API)
  - Line for weather-adjusted AQI forecast (computed)
  - Area or bar chart for key weather driver (wind speed / humidity)
- Shared X-axis: hourly timestamps for next 24h
- Tooltip on hover showing all values
- Legend toggles to show/hide series
- Responsive container (100% width, fixed height on desktop)

**`InsightPanel.tsx`**
- Generates 1–3 plain-language sentences from forecast data
- Examples:
  - "Wind speeds are expected to drop tomorrow morning, which may let PM2.5 accumulate — AQI could rise to Moderate."
  - "Incoming precipitation should improve air quality overnight."
  - "Current wind speeds are dispersing pollutants effectively — expect Good to Moderate air quality throughout the day."
- Logic: evaluates predicted weather changes and correlates to AQI forecast

### Data Layer

**`src/lib/api-clients.ts`**
- Pure functions for each external API call:
  - `fetchGeocoding(query: string)` → `{lat, lon, displayName}`
  - `fetchWeather(lat, lon)` → `{current, hourly}`
  - `fetchAirQuality(lat, lon)` → `{current, hourly}`
  - `fetchWAQI(lat, lon, token?)` → `{aqi, components}` (optional fallback)
- Error handling: catches network/parse errors, logs, returns null or cached data
- Rate limit awareness: logs API call counts

**`src/lib/forecast.ts`**
- Core forecasting logic:
  - `computeCoupledForecast(weatherHourly, aqiHourly)` → `adjustedAQI[]`
  - Applies weighted adjustments based on weather variables
  - Returns both raw and adjusted series for charting
  - `generateInsightSentence(forecast, weather)` → `string`

**`src/lib/types.ts`**
- TypeScript interfaces for all API responses and internal models:
  - `City`, `WeatherData`, `AirQualityData`, `Forecast`, `ForecastHour`
  - Ensures type safety across all components and API calls

### State Management

- **React Server Components (RSC)** for initial data fetch (page-level)
- **Client-side React Query / SWR** for re-fetches and mutations
- **URL search params** to persist selected city (shareable links)
- **localStorage** for recent cities (optional convenience feature)

---

## Error Handling & Resilience

1. **API Failures:**
   - If geocoding fails → show "City not found" toast, suggest alternatives
   - If weather/AQI API fails → show "Data temporarily unavailable" with option to retry or use cached last-known values
   - WAQI as optional fallback if Open-Meteo air quality is down

2. **User Experience:**
   - Loading skeleton cards while fetching
   - Error toast notifications (auto-dismiss after 5s)
   - Empty state if no city is selected
   - Graceful degradation (show raw forecast if coupling function fails)

3. **Network Resilience:**
   - Automatic retry logic (SWR default: exponential backoff)
   - Connection timeout: 10s per request
   - Cache responses in-memory for 5 minutes

---

## Performance Considerations

- **Server-side rendering:** Initial forecast page rendered on server for fast FCP
- **Image optimization:** Next.js Image component for any weather/AQI icons
- **Code splitting:** Components lazy-load charts (Recharts is ~150KB gzip)
- **Data fetching:** Single aggregated `/api/forecast` endpoint to reduce request count
- **CSS:** Tailwind purges unused styles; production bundle ~30KB gzip

---

## Security

- **API keys:** Open-Meteo requires no keys; WAQI token stored only in `.env.local` (never committed)
- **CORS:** Server-side API routes proxy external requests (no client-side cross-origin calls)
- **Input validation:** City search sanitized; lat/lon validated server-side
- **Rate limiting:** Respects API provider rate limits; built-in backoff for dev/demo use
- **Sensitive data:** No user data collected or stored (anonymous usage)

---

## Deployment Architecture

```
┌──────────────────┐
│   Git Repository │
└────────┬─────────┘
         │ git push
         ▼
┌──────────────────┐
│  Vercel CI/CD    │  Auto-builds on push
└────────┬─────────┘  Runs npm run build
         │
         ▼
┌──────────────────────────────────┐
│  Vercel Edge Functions / Serverless │
│  (Next.js API routes)              │
└────────┬──────────────────────────┘
         │
         ├──→ Open-Meteo APIs (external)
         └──→ Vercel CDN (static + dynamic)

Live URL: https://sih26082.vercel.app (example)
```

---

## Extensibility

Future enhancements without breaking current MVP:

1. **Multi-pollutant support:** Switch between PM2.5, PM10, O3, NO2
2. **Historical analysis:** Store hourly snapshots, compare trends
3. **Location bookmarking:** Save favorite cities with localStorage
4. **Dark/light mode toggle:** Tailwind theme switching
5. **Mobile app:** React Native version sharing same `/api` routes
6. **Advanced forecasting:** Add ML model (e.g., XGBoost) if more accuracy needed

---

## Testing Strategy

- **Unit tests:** Forecast logic (`forecast.ts`) using Jest
- **Integration tests:** API client functions with mock responses
- **E2E tests:** Playwright for full user flows (search → view forecast → switch city)
- **Manual testing:** Cross-browser (Chrome, Firefox, Safari) and device sizes (375px, 768px, 1920px)

---

## Monitoring & Observability

- **Error logging:** Errors sent to browser console (dev) or external service (production)
- **Performance metrics:** Web Vitals (CLS, LCP, FID) via vercel/web-vitals package
- **Analytics:** (Optional) Vercel Analytics for traffic/performance insights
- **API health:** Simple status endpoint at `/api/health` checks external API availability

---

## Summary

This architecture prioritizes simplicity, performance, and maintainability. All data flows through simple, typed functions with clear error boundaries. The coupling logic is isolated in a pure function for easy testing and future enhancement. Deployment is zero-friction via Vercel's auto-CI/CD, requiring no infrastructure management.
