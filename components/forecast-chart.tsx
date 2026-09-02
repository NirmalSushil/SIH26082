'use client';

import React, { useState, useEffect } from 'react';
import { Forecast } from '@/lib/types';
import { formatTime, formatShortDateTime } from '@/lib/utils';
import {
  ComposedChart,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  CloudSun,
  Layers,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface ForecastChartProps {
  forecast: Forecast | null;
  isLoading?: boolean;
}

type TabType = 'coupled' | 'weather' | 'pollutants';
type TimeRange = '12h' | '24h' | '48h';

export function ForecastChart({ forecast, isLoading }: ForecastChartProps) {
  const [activeTab, setActiveTab] = useState<TabType>('coupled');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isLoading || !forecast) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl h-[380px] animate-pulse border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  const hoursLimit = timeRange === '12h' ? 12 : timeRange === '24h' ? 24 : 48;
  const filteredHourly = forecast.hourly.slice(0, hoursLimit);

  const chartData = filteredHourly.map((hour) => ({
    time: formatTime(hour.time),
    shortDate: formatShortDateTime(hour.time),
    raw_aqi: hour.raw_aqi,
    adjusted_aqi: hour.adjusted_aqi,
    delta_aqi: hour.delta_aqi,
    temperature: hour.temperature_2m,
    humidity: hour.relative_humidity_2m,
    wind_speed: hour.wind_speed_10m,
    precipitation: hour.precipitation,
    pm2_5: hour.pm2_5,
    pm10: hour.pm10,
    ozone: hour.ozone || 0,
    no2: hour.nitrogen_dioxide || 0,
    timestamp: hour.time,
  }));

  // Custom Interactive Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-slate-100 p-3.5 rounded-xl border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs min-w-[210px] space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 font-semibold text-slate-300">
            <span>{data.shortDate}</span>
            <span className="font-mono text-[11px] text-blue-400">Hour Forecast</span>
          </div>

          {activeTab === 'coupled' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Coupled AQI:
                </span>
                <span className="font-bold text-sm text-white">{data.adjusted_aqi}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Raw AQI:
                </span>
                <span className="font-medium text-slate-300">{data.raw_aqi}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                <span className="text-slate-400">Weather Effect:</span>
                <span
                  className={`font-semibold ${
                    data.delta_aqi > 0
                      ? 'text-rose-400'
                      : data.delta_aqi < 0
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {data.delta_aqi > 0 ? `+${data.delta_aqi}` : data.delta_aqi} pts
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Wind Speed:</span>
                <span>{data.wind_speed} km/h</span>
              </div>
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-amber-400">
                <span>Temperature:</span>
                <span className="font-bold">{data.temperature}°C</span>
              </div>
              <div className="flex items-center justify-between text-blue-400">
                <span>Humidity:</span>
                <span className="font-bold">{data.humidity}%</span>
              </div>
              <div className="flex items-center justify-between text-indigo-400">
                <span>Wind Speed:</span>
                <span className="font-bold">{data.wind_speed} km/h</span>
              </div>
              <div className="flex items-center justify-between text-cyan-400">
                <span>Precipitation:</span>
                <span className="font-bold">{data.precipitation} mm</span>
              </div>
            </div>
          )}

          {activeTab === 'pollutants' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-rose-400">
                <span>PM2.5:</span>
                <span className="font-bold">{data.pm2_5} µg/m³</span>
              </div>
              <div className="flex items-center justify-between text-amber-400">
                <span>PM10:</span>
                <span className="font-bold">{data.pm10} µg/m³</span>
              </div>
              <div className="flex items-center justify-between text-purple-400">
                <span>Ozone (O₃):</span>
                <span className="font-bold">{data.ozone} µg/m³</span>
              </div>
              <div className="flex items-center justify-between text-blue-400">
                <span>NO₂:</span>
                <span className="font-bold">{data.no2} µg/m³</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Controls Bar: Tabs & Time Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Coupled Atmospheric Forecast
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare standard air quality vs meteorology-coupled trajectory
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart View Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('coupled')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'coupled'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AQI Coupling
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'weather'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5" />
              Weather Drivers
            </button>
            <button
              onClick={() => setActiveTab('pollutants')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'pollutants'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Pollutants
            </button>
          </div>

          {/* Time Window Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
            {(['12h', '24h', '48h'] as TimeRange[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  timeRange === t
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Responsive Chart */}
      <div className="w-full h-[340px] pt-2">
        {isMounted && (
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'coupled' ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adjustedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={11}
                  interval={timeRange === '48h' ? 3 : 1}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="aqi"
                  stroke="#94a3b8"
                  fontSize={11}
                  domain={[0, 'auto']}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="wind"
                  orientation="right"
                  stroke="#818cf8"
                  fontSize={11}
                  domain={[0, 40]}
                  hide={true}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '14px', fontSize: '12px' }}
                  iconType="circle"
                />

                {/* EPA Moderate & Unhealthy Reference Bands */}
                <ReferenceLine
                  yAxisId="aqi"
                  y={50}
                  stroke="#10b981"
                  strokeDasharray="2 2"
                  strokeOpacity={0.4}
                />
                <ReferenceLine
                  yAxisId="aqi"
                  y={100}
                  stroke="#f59e0b"
                  strokeDasharray="2 2"
                  strokeOpacity={0.4}
                />
                <ReferenceLine
                  yAxisId="aqi"
                  y={150}
                  stroke="#ef4444"
                  strokeDasharray="2 2"
                  strokeOpacity={0.4}
                />

                {/* Wind Background Area */}
                <Area
                  yAxisId="wind"
                  type="monotone"
                  dataKey="wind_speed"
                  name="Wind Speed (km/h)"
                  fill="url(#windGradient)"
                  stroke="#818cf8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />

                {/* Weather-Adjusted AQI (Primary) */}
                <Area
                  yAxisId="aqi"
                  type="monotone"
                  dataKey="adjusted_aqi"
                  name="Coupled Weather-Adjusted AQI"
                  fill="url(#adjustedGradient)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />

                {/* Raw AQI (Baseline comparison) */}
                <Line
                  yAxisId="aqi"
                  type="monotone"
                  dataKey="raw_aqi"
                  name="Raw Sensor AQI (Baseline)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            ) : activeTab === 'weather' ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={11}
                  interval={timeRange === '48h' ? 3 : 1}
                  tickLine={false}
                />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '14px', fontSize: '12px' }} iconType="circle" />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="wind_speed"
                  name="Wind Speed (km/h)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (%)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="precipitation"
                  name="Precipitation (mm)"
                  fill="#38bdf8"
                  stroke="#0284c7"
                  fillOpacity={0.4}
                />
              </ComposedChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={11}
                  interval={timeRange === '48h' ? 3 : 1}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '14px', fontSize: '12px' }} iconType="circle" />

                <Line
                  type="monotone"
                  dataKey="pm2_5"
                  name="PM2.5 (µg/m³)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="pm10"
                  name="PM10 (µg/m³)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ozone"
                  name="Ozone O₃ (µg/m³)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="no2"
                  name="NO₂ (µg/m³)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Insight Explainer Footnote */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
        <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-blue-900 dark:text-blue-300">Raw Baseline AQI</span>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              Standard chemical transport model without real-time microclimate adjustment.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-emerald-900 dark:text-emerald-300">
              Weather-Coupled AQI
            </span>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              Adjusted for wind shear, precipitation scavenging, and thermal boundary layers.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-indigo-900 dark:text-indigo-300">Atmospheric Drivers</span>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              Wind velocity (&gt;15 km/h) purges smog; stagnant air and cool nocturnal inversions trap pollutants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
