// TypeScript types and interfaces for the Air Pollution–Weather Coupled Forecast app

/**
 * Geocoded city location
 */
export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/province
  timezone?: string;
  displayName: string; // e.g., "London, United Kingdom"
}

/**
 * Current weather conditions
 */
export interface CurrentWeather {
  time: string; // ISO 8601 timestamp
  temperature_2m: number; // °C
  apparent_temperature?: number; // °C
  relative_humidity_2m: number; // 0-100%
  weather_code: number; // WMO weather code
  wind_speed_10m: number; // km/h
  wind_gusts_10m?: number; // km/h
  wind_direction_10m?: number; // degrees
  precipitation: number; // mm
  pressure_msl: number; // hPa
}

/**
 * Hourly weather forecast
 */
export interface WeatherHourly {
  time: string[]; // ISO 8601 timestamps
  temperature_2m: number[];
  apparent_temperature?: number[];
  relative_humidity_2m: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  wind_gusts_10m?: number[];
  wind_direction_10m?: number[];
  precipitation: number[]; // mm
  precipitation_probability?: number[]; // %
  pressure_msl: number[];
}

/**
 * Full weather response from Open-Meteo
 */
export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  hourly: WeatherHourly;
}

/**
 * Current air quality
 */
export interface CurrentAirQuality {
  time: string; // ISO 8601 timestamp
  us_aqi: number; // US EPA AQI (0-500+)
  european_aqi?: number;
  pm2_5: number; // µg/m³
  pm10: number; // µg/m³
  ozone?: number; // µg/m³
  nitrogen_dioxide?: number; // µg/m³
  sulphur_dioxide?: number; // µg/m³
  carbon_monoxide?: number; // µg/m³
}

/**
 * Hourly air quality forecast
 */
export interface AirQualityHourly {
  time: string[];
  us_aqi: number[];
  european_aqi?: number[];
  pm2_5: number[];
  pm10: number[];
  ozone?: number[];
  nitrogen_dioxide?: number[];
  sulphur_dioxide?: number[];
  carbon_monoxide?: number[];
}

/**
 * Full air quality response from Open-Meteo
 */
export interface AirQualityData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentAirQuality;
  hourly: AirQualityHourly;
}

/**
 * Coupling factor deltas
 */
export interface CouplingFactors {
  windAdjustment: number;
  stabilityAdjustment: number;
  precipitationAdjustment: number;
  pressureAdjustment: number;
  photochemicalAdjustment: number;
  totalAdjustment: number;
}

/**
 * Single forecast hour (combined weather + AQI)
 */
export interface ForecastHour {
  time: string; // ISO 8601 timestamp
  raw_aqi: number; // Raw AQI from API
  adjusted_aqi: number; // Coupling-adjusted AQI
  delta_aqi: number; // adjusted - raw
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  wind_gusts_10m?: number;
  precipitation: number;
  pressure_msl: number;
  weather_code: number;
  pm2_5: number;
  pm10: number;
  ozone?: number;
  nitrogen_dioxide?: number;
  sulphur_dioxide?: number;
  carbon_monoxide?: number;
  factors: CouplingFactors;
}

/**
 * Health and activity recommendations
 */
export interface HealthAdvisory {
  category: string;
  status: 'safe' | 'caution' | 'warning' | 'danger';
  title: string;
  recommendation: string;
  iconName: string;
}

/**
 * Summary of coupling analysis
 */
export interface CouplingSummary {
  dominantFactor: string;
  dispersionRating: 'Poor' | 'Moderate' | 'Good' | 'Excellent';
  inversionRisk: 'Low' | 'Moderate' | 'High';
  washoutEffect: 'None' | 'Light' | 'Moderate' | 'Strong';
  averageAdjustment: number;
  peakHour: {
    time: string;
    aqi: number;
  };
  bestHour: {
    time: string;
    aqi: number;
  };
}

/**
 * Complete forecast including raw and adjusted series
 */
export interface Forecast {
  city: City;
  current: {
    aqi: number;
    adjusted_aqi: number;
    delta_aqi: number;
    severity: string;
    dominant_pollutant: string;
    temperature_2m: number;
    apparent_temperature: number;
    humidity: number;
    wind_speed: number;
    wind_gusts: number;
    precipitation: number;
    pressure: number;
    weather_code: number;
    pm2_5: number;
    pm10: number;
    ozone: number;
    nitrogen_dioxide: number;
    sulphur_dioxide: number;
    carbon_monoxide: number;
  };
  hourly: ForecastHour[];
  insight: string; // Plain-language forecast explanation
  couplingSummary: CouplingSummary;
  advisories: HealthAdvisory[];
  fetchedAt: string; // ISO 8601 timestamp
}

/**
 * API response envelope
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * WAQI response (optional fallback)
 */
export interface WAQIResponse {
  status: string;
  data?: {
    aqi: number;
    idx: number;
    city: {
      name: string;
      geo: [number, number]; // [lat, lon]
    };
    iaqi?: {
      pm25?: { v: number };
      pm10?: { v: number };
      o3?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
    };
  };
}

/**
 * AQI severity classification (US EPA)
 */
export enum AQISeverity {
  GOOD = 'Good',
  MODERATE = 'Moderate',
  UNHEALTHY_SENSITIVE = 'Unhealthy for Sensitive Groups',
  UNHEALTHY = 'Unhealthy',
  VERY_UNHEALTHY = 'Very Unhealthy',
  HAZARDOUS = 'Hazardous',
}

/**
 * Get AQI severity from AQI value (US EPA scale)
 */
export function getAQISeverity(aqi: number): AQISeverity {
  if (aqi <= 50) return AQISeverity.GOOD;
  if (aqi <= 100) return AQISeverity.MODERATE;
  if (aqi <= 150) return AQISeverity.UNHEALTHY_SENSITIVE;
  if (aqi <= 200) return AQISeverity.UNHEALTHY;
  if (aqi <= 300) return AQISeverity.VERY_UNHEALTHY;
  return AQISeverity.HAZARDOUS;
}

/**
 * Get color theme token for AQI
 */
export interface AQITheme {
  label: AQISeverity;
  bgClass: string;
  textClass: string;
  borderClass: string;
  glowClass: string;
  badgeBg: string;
  hex: string;
  description: string;
}

export function getAQITheme(aqi: number): AQITheme {
  if (aqi <= 50) {
    return {
      label: AQISeverity.GOOD,
      bgClass: 'from-emerald-500/20 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500/30 dark:border-emerald-500/30',
      glowClass: 'shadow-emerald-500/20',
      badgeBg: 'bg-emerald-500 text-white',
      hex: '#10b981',
      description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
    };
  }
  if (aqi <= 100) {
    return {
      label: AQISeverity.MODERATE,
      bgClass: 'from-amber-500/20 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/10',
      textClass: 'text-amber-600 dark:text-amber-400',
      borderClass: 'border-amber-500/30 dark:border-amber-500/30',
      glowClass: 'shadow-amber-500/20',
      badgeBg: 'bg-amber-500 text-white',
      hex: '#f59e0b',
      description: 'Air quality is acceptable. However, unusually sensitive individuals may experience symptoms.',
    };
  }
  if (aqi <= 150) {
    return {
      label: AQISeverity.UNHEALTHY_SENSITIVE,
      bgClass: 'from-orange-500/20 to-amber-600/10 dark:from-orange-500/20 dark:to-amber-600/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-500/30 dark:border-orange-500/30',
      glowClass: 'shadow-orange-500/20',
      badgeBg: 'bg-orange-500 text-white',
      hex: '#f97316',
      description: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
    };
  }
  if (aqi <= 200) {
    return {
      label: AQISeverity.UNHEALTHY,
      bgClass: 'from-rose-500/20 to-red-600/10 dark:from-rose-500/20 dark:to-red-600/10',
      textClass: 'text-rose-600 dark:text-rose-400',
      borderClass: 'border-rose-500/30 dark:border-rose-500/30',
      glowClass: 'shadow-rose-500/20',
      badgeBg: 'bg-rose-600 text-white',
      hex: '#e11d48',
      description: 'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.',
    };
  }
  if (aqi <= 300) {
    return {
      label: AQISeverity.VERY_UNHEALTHY,
      bgClass: 'from-purple-500/20 to-indigo-600/10 dark:from-purple-500/20 dark:to-indigo-600/10',
      textClass: 'text-purple-600 dark:text-purple-400',
      borderClass: 'border-purple-500/30 dark:border-purple-500/30',
      glowClass: 'shadow-purple-500/20',
      badgeBg: 'bg-purple-600 text-white',
      hex: '#9333ea',
      description: 'Health alert: The risk of health effects is increased for everyone.',
    };
  }
  return {
    label: AQISeverity.HAZARDOUS,
    bgClass: 'from-red-900/30 to-purple-950/20 dark:from-red-900/30 dark:to-purple-950/20',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-700/40 dark:border-red-700/40',
    glowClass: 'shadow-red-900/30',
    badgeBg: 'bg-red-900 text-white',
    hex: '#7f1d1d',
    description: 'Health warning of emergency conditions: everyone is more likely to be affected.',
  };
}

/**
 * Get color for AQI value (for legacy compatibility)
 */
export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return 'bg-emerald-600';
  if (aqi <= 100) return 'bg-amber-500';
  if (aqi <= 150) return 'bg-orange-500';
  if (aqi <= 200) return 'bg-rose-600';
  if (aqi <= 300) return 'bg-purple-600';
  return 'bg-red-900';
}

/**
 * Get text color for AQI value
 */
export function getAQITextColor(aqi: number): string {
  if (aqi <= 50) return 'text-emerald-600 dark:text-emerald-400';
  if (aqi <= 100) return 'text-amber-600 dark:text-amber-400';
  if (aqi <= 150) return 'text-orange-600 dark:text-orange-400';
  if (aqi <= 200) return 'text-rose-600 dark:text-rose-400';
  if (aqi <= 300) return 'text-purple-600 dark:text-purple-400';
  return 'text-red-700 dark:text-red-400';
}
