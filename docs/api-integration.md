# API Integration Guide

## Overview

This application uses three free, no-signup APIs from Open-Meteo to fetch weather, air quality, and geocoding data. All endpoints are HTTP GET requests with no authentication required.

---

## 1. Geocoding API

**Endpoint:** `https://geocoding-api.open-meteo.com/v1/search`

**Purpose:** Convert city name → latitude and longitude

### Request Example

```http
GET https://geocoding-api.open-meteo.com/v1/search?name=London&count=10&language=en
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✓ | City name (e.g., "London", "New York") |
| `count` | int | Optional | Number of suggestions to return (default: 10) |
| `language` | string | Optional | Language for results (default: en) |

### Response Example

```json
{
  "results": [
    {
      "id": 2643743,
      "name": "London",
      "latitude": 51.5085,
      "longitude": -0.1257,
      "elevation": 11,
      "feature_code": "PPLC",
      "country_code": "GB",
      "admin1": "England",
      "country": "United Kingdom",
      "population": 8901000,
      "timezone": "Europe/London"
    }
  ],
  "generationtime_ms": 1.234
}
```

**Key Fields Used:**
- `results[0].latitude`, `results[0].longitude` — passed to Weather and Air Quality APIs
- `results[0].name` — display name for the selected city
- `results[0].timezone` — (optional) for timezone-aware forecasts

**Error Handling:**
- Empty `results` array → "City not found"
- Network error → retry with exponential backoff
- Rate limit (unlikely) → implement 1-second delay between requests

### Rate Limits

- No documented hard limit; typical usage (<100 req/min) is safe
- Recommended: debounce search input (300ms) to avoid rapid requests

---

## 2. Weather API

**Endpoint:** `https://api.open-meteo.com/v1/forecast`

**Purpose:** Fetch current and hourly weather forecast

### Request Example

```http
GET https://api.open-meteo.com/v1/forecast?latitude=51.5085&longitude=-0.1257&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,pressure_msl&timezone=auto
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | ✓ | City latitude |
| `longitude` | float | ✓ | City longitude |
| `current` | string (CSV) | ✓ | Current conditions to fetch |
| `hourly` | string (CSV) | ✓ | Hourly forecast variables |
| `timezone` | string | Optional | "auto" (recommended) or specific IANA timezone |

**Supported Variables** (excerpt):

*Current:*
- `temperature_2m` — temperature in °C
- `relative_humidity_2m` — humidity 0–100%
- `weather_code` — WMO code (e.g., 0=clear, 1=mainly clear, 3=overcast, 45=foggy, 51=drizzle, 61=rain, 80=rain showers)
- `wind_speed_10m` — wind speed in km/h
- `pressure_msl` — sea-level pressure in hPa

*Hourly:* Same as above, plus `precipitation` (mm)

### Response Example

```json
{
  "latitude": 51.5085,
  "longitude": -0.1257,
  "generationtime_ms": 12.345,
  "utc_offset_seconds": 0,
  "timezone": "GMT",
  "current": {
    "time": "2024-09-02T14:30:00Z",
    "temperature_2m": 18.5,
    "relative_humidity_2m": 65,
    "weather_code": 3,
    "wind_speed_10m": 12.5,
    "pressure_msl": 1013.25
  },
  "hourly": {
    "time": ["2024-09-02T14:00:00Z", "2024-09-02T15:00:00Z", ...],
    "temperature_2m": [18.2, 18.5, 19.1, ...],
    "relative_humidity_2m": [60, 65, 70, ...],
    "weather_code": [3, 3, 2, ...],
    "wind_speed_10m": [12.0, 12.5, 13.2, ...],
    "precipitation": [0, 0, 0.2, ...],
    "pressure_msl": [1013.1, 1013.25, 1013.4, ...]
  }
}
```

**Key Fields Used:**
- `current.*` — displayed in CurrentConditions card
- `hourly.time` — X-axis labels (timestamps) for chart
- `hourly.wind_speed_10m`, `hourly.relative_humidity_2m`, `hourly.precipitation` — inputs to coupling function
- `hourly.temperature_2m` — (optional) additional weather insight

**Error Handling:**
- Invalid lat/lon → API returns 400 Bad Request
- Unavailable region → API returns empty hourly data
- Network timeout → retry with backoff; show "Weather data unavailable"

### Rate Limits

- Free tier: ~10,000 requests/day per IP
- Recommended: cache responses for 30 minutes per city

---

## 3. Air Quality API

**Endpoint:** `https://air-quality-api.open-meteo.com/v1/air-quality`

**Purpose:** Fetch current and hourly air quality forecast

### Request Example

```http
GET https://air-quality-api.open-meteo.com/v1/air-quality?latitude=51.5085&longitude=-0.1257&current=us_aqi,pm2_5,pm10&hourly=us_aqi,pm2_5,pm10,o3,no2&timezone=auto
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | ✓ | City latitude |
| `longitude` | float | ✓ | City longitude |
| `current` | string (CSV) | ✓ | Current AQI variables |
| `hourly` | string (CSV) | ✓ | Hourly AQI forecast |
| `timezone` | string | Optional | "auto" or IANA timezone |

**Supported Variables:**
- `us_aqi` — US EPA Air Quality Index (0–500+)
- `european_aqi` — EU AQI (0–500+)
- `pm2_5` — PM2.5 concentration (µg/m³)
- `pm10` — PM10 concentration (µg/m³)
- `o3` — Ozone (ppb)
- `no2` — Nitrogen Dioxide (ppb)
- `so2` — Sulfur Dioxide (ppb)
- `co` — Carbon Monoxide (ppb)

### Response Example

```json
{
  "latitude": 51.5085,
  "longitude": -0.1257,
  "generationtime_ms": 8.901,
  "utc_offset_seconds": 0,
  "timezone": "GMT",
  "current": {
    "time": "2024-09-02T14:30:00Z",
    "us_aqi": 52,
    "pm2_5": 12.5,
    "pm10": 25.3
  },
  "hourly": {
    "time": ["2024-09-02T14:00:00Z", "2024-09-02T15:00:00Z", ...],
    "us_aqi": [50, 52, 55, 58, 60, ...],
    "pm2_5": [12.0, 12.5, 13.2, 14.1, 15.0, ...],
    "pm10": [24.5, 25.3, 26.1, 27.2, 28.5, ...]
  }
}
```

**Key Fields Used:**
- `current.us_aqi` — displayed in CurrentConditions card with color coding
- `hourly.us_aqi` — raw forecast line in chart (input to coupling function)
- `hourly.pm2_5`, `hourly.pm10` — used to validate coupling adjustments

**Error Handling:**
- No data for region → API returns `null` for hourly/current values
- Network timeout → retry; show "AQI data temporarily unavailable"

### Rate Limits

- Free tier: ~10,000 requests/day per IP
- Same as Weather API; can combine into single aggregated call

---

## 4. WAQI API (Optional Fallback)

**Endpoint:** `https://api.waqi.info/feed/{city}/?token={token}`

**Purpose:** Cross-check AQI data or fallback if Open-Meteo unavailable

### Setup

1. Sign up (free): https://waqi.info/
2. Get API token: https://waqi.info/api/account/token
3. Store in `.env.local`:
   ```
   NEXT_PUBLIC_WAQI_TOKEN=abc123xyz...
   ```

### Request Example

```http
GET https://api.waqi.info/feed/London/?token=abc123xyz
```

### Response Example

```json
{
  "status": "ok",
  "data": {
    "aqi": 52,
    "idx": 2419,
    "city": {
      "name": "London",
      "geo": [51.5085, -0.1257]
    },
    "iaqi": {
      "pm25": { "v": 12.5 },
      "pm10": { "v": 25.3 },
      "o3": { "v": 45.2 }
    }
  }
}
```

**Use Case:** Fallback if Open-Meteo air quality is unavailable for a city

---

## Data Aggregation Endpoint

**Suggested Implementation:** `/api/forecast`

```typescript
// POST /api/forecast
// Request body: { latitude, longitude }
// Response: aggregated { current, hourly, forecast }

// Internally:
// 1. Fetch weather from Open-Meteo Weather API
// 2. Fetch air quality from Open-Meteo Air Quality API
// 3. Run coupling function on hourly data
// 4. Return combined response with both raw and adjusted forecasts
```

This single endpoint reduces client-side request count and allows server-side caching.

---

## Request Error Handling Template

```typescript
async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, { timeout: 10000 });
      if (response.ok) return response.json();
      if (response.status === 429) {
        // Rate limited — exponential backoff
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        continue;
      }
      if (response.status >= 500) {
        // Server error — retry
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        continue;
      }
      // Client error (4xx) — don't retry
      return null;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
  return null;
}
```

---

## Rate Limiting Summary

| API | Free Tier Limit | Recommended Cache |
|-----|-----------------|-------------------|
| Geocoding | ~10,000/day | 24h |
| Weather | ~10,000/day | 30 min |
| Air Quality | ~10,000/day | 30 min |
| WAQI (optional) | ~10,000/day | 1h |

---

## Testing

Use `curl` or Postman to test endpoints:

```bash
# Geocoding
curl "https://geocoding-api.open-meteo.com/v1/search?name=London&count=5"

# Weather
curl "https://api.open-meteo.com/v1/forecast?latitude=51.5085&longitude=-0.1257&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,wind_speed_10m,precipitation"

# Air Quality
curl "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=51.5085&longitude=-0.1257&current=us_aqi,pm2_5&hourly=us_aqi,pm2_5"
```

All endpoints return JSON; no additional headers required.
