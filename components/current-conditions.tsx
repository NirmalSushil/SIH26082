'use client';

import React from 'react';
import { Forecast, getAQITheme } from '@/lib/types';
import { getWeatherInfo, POLLUTANT_THRESHOLDS } from '@/lib/utils';
import {
  Wind,
  Droplets,
  Gauge,
  Thermometer,
  CloudRain,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Sun,
  Cloud,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Activity,
} from 'lucide-react';

interface CurrentConditionsProps {
  forecast: Forecast | null;
  isLoading?: boolean;
}

export function CurrentConditions({ forecast, isLoading }: CurrentConditionsProps) {
  if (isLoading || !forecast) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const { current, city } = forecast;
  const theme = getAQITheme(current.adjusted_aqi);
  const weatherInfo = getWeatherInfo(current.weather_code);

  const renderWeatherIcon = (name: string) => {
    switch (name) {
      case 'Sun':
        return <Sun className="w-6 h-6 text-amber-500" />;
      case 'Cloud':
        return <Cloud className="w-6 h-6 text-slate-400" />;
      case 'CloudRain':
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'CloudSnow':
        return <CloudSnow className="w-6 h-6 text-cyan-400" />;
      case 'CloudLightning':
        return <CloudLightning className="w-6 h-6 text-amber-400" />;
      case 'CloudFog':
        return <CloudFog className="w-6 h-6 text-slate-400" />;
      default:
        return <Sun className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with City & Time */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {city.displayName}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Live Station
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Coordinates: {city.latitude.toFixed(3)}°N, {city.longitude.toFixed(3)}°E • Updated{' '}
            {new Date(forecast.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Weather-Coupled Atmosphere Engine</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Large Hero AQI Card with Dynamic Glow */}
        <div
          className={`md:col-span-2 rounded-2xl p-6 bg-gradient-to-br ${theme.bgClass} border ${theme.borderClass} shadow-lg relative overflow-hidden backdrop-blur-md transition-all`}
        >
          {/* Subtle background glow */}
          <div
            className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: theme.hex }}
          />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${theme.badgeBg}`}>
                  {theme.label}
                </span>
                {current.delta_aqi !== 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-semibold flex items-center gap-0.5 ${
                      current.delta_aqi > 0
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                    }`}
                  >
                    {current.delta_aqi > 0 ? (
                      <>
                        <ArrowUpRight className="w-3 h-3" /> +{current.delta_aqi} from weather
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="w-3 h-3" /> {current.delta_aqi} from weather
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {current.adjusted_aqi}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Coupled AQI (Raw: {current.aqi})
                </span>
              </div>
            </div>

            <div className="p-3 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-white/20 dark:border-slate-800 backdrop-blur-sm">
              <Gauge className="w-8 h-8 text-slate-800 dark:text-slate-200" />
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed relative z-10">
            {theme.description}
          </p>

          {/* AQI Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span>0 Good</span>
              <span>100 Mod</span>
              <span>150 Sens</span>
              <span>200 Unhealthy</span>
              <span>300+ Haz</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (current.adjusted_aqi / 300) * 100)}%`,
                  backgroundColor: theme.hex,
                }}
              />
            </div>
          </div>
        </div>

        {/* Temperature Card */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Temperature</span>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {current.temperature_2m}°C
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Feels like {current.apparent_temperature}°C
              </div>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
              <Thermometer className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Condition</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              {renderWeatherIcon(weatherInfo.iconName)}
              {weatherInfo.label}
            </span>
          </div>
        </div>

        {/* Wind Card */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Wind Dynamics</span>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {current.wind_speed} <span className="text-sm font-normal text-slate-500">km/h</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Gusts up to {current.wind_gusts} km/h
              </div>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <Wind className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Dispersion Capacity</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {forecast.couplingSummary.dispersionRating}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics: Pollutants Suite */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            Atmospheric Pollutant Concentrations
          </h3>
          <span className="text-xs text-slate-400">WHO & US EPA Baseline Standards</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* PM2.5 */}
          <div className="glass-card rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-slate-100">PM2.5</span>
              <span className="text-[10px] text-slate-400">Fine</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
              {current.pm2_5} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {current.pm2_5 <= POLLUTANT_THRESHOLDS.pm2_5.good ? (
                <span className="text-emerald-500 font-medium">Within WHO limit</span>
              ) : (
                <span className="text-amber-500 font-medium">Elevated</span>
              )}
            </div>
          </div>

          {/* PM10 */}
          <div className="glass-card rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-slate-100">PM10</span>
              <span className="text-[10px] text-slate-400">Coarse</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
              {current.pm10} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {current.pm10 <= POLLUTANT_THRESHOLDS.pm10.good ? (
                <span className="text-emerald-500 font-medium">Good standard</span>
              ) : (
                <span className="text-amber-500 font-medium">Moderate</span>
              )}
            </div>
          </div>

          {/* Ozone O3 */}
          <div className="glass-card rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-slate-100">Ozone (O₃)</span>
              <span className="text-[10px] text-slate-400">Photochem</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
              {current.ozone} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {current.ozone <= POLLUTANT_THRESHOLDS.ozone.good ? (
                <span className="text-emerald-500 font-medium">Safe range</span>
              ) : (
                <span className="text-amber-500 font-medium">Active</span>
              )}
            </div>
          </div>

          {/* Nitrogen Dioxide NO2 */}
          <div className="glass-card rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-slate-100">NO₂</span>
              <span className="text-[10px] text-slate-400">Traffic</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
              {current.nitrogen_dioxide} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-emerald-500 font-medium">Standard</span>
            </div>
          </div>

          {/* Sulphur Dioxide SO2 */}
          <div className="glass-card rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-slate-100">SO₂</span>
              <span className="text-[10px] text-slate-400">Industrial</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
              {current.sulphur_dioxide} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-emerald-500 font-medium">Standard</span>
            </div>
          </div>

          {/* Carbon Monoxide CO */}
          <div className="glass-card rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-slate-100">CO</span>
              <span className="text-[10px] text-slate-400">Combustion</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
              {current.carbon_monoxide} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-emerald-500 font-medium">Safe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Environment Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-slate-400">Relative Humidity</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">{current.humidity}%</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Compass className="w-5 h-5 text-indigo-500" />
          <div>
            <div className="text-slate-400">Atmospheric Pressure</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">{current.pressure} hPa</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CloudRain className="w-5 h-5 text-cyan-500" />
          <div>
            <div className="text-slate-400">Precipitation</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">{current.precipitation} mm</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-emerald-500" />
          <div>
            <div className="text-slate-400">Dominant Pollutant</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">{current.dominant_pollutant}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
