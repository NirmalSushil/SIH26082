'use client';

import React, { useRef } from 'react';
import { Forecast, getAQITheme } from '@/lib/types';
import { formatTime, getWeatherInfo } from '@/lib/utils';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
} from 'lucide-react';

interface HourlyTimelineProps {
  forecast: Forecast | null;
}

export function HourlyTimeline({ forecast }: HourlyTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!forecast || !forecast.hourly.length) return null;

  const hours = forecast.hourly.slice(0, 24);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const renderWeatherIcon = (name: string) => {
    switch (name) {
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Cloud':
        return <Cloud className="w-5 h-5 text-slate-400" />;
      case 'CloudRain':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'CloudSnow':
        return <CloudSnow className="w-5 h-5 text-cyan-400" />;
      case 'CloudLightning':
        return <CloudLightning className="w-5 h-5 text-amber-400" />;
      case 'CloudFog':
        return <CloudFog className="w-5 h-5 text-slate-400" />;
      default:
        return <Sun className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            24-Hour Atmospheric Timeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hourly progression of coupled AQI, temperature, and dispersion
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Timeline */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
      >
        {hours.map((hour, idx) => {
          const theme = getAQITheme(hour.adjusted_aqi);
          const weather = getWeatherInfo(hour.weather_code);
          const isNow = idx === 0;

          return (
            <div
              key={hour.time}
              className={`shrink-0 w-28 rounded-xl p-3 flex flex-col items-center justify-between text-center border transition-all ${
                isNow
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              {/* Time */}
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {isNow ? 'Now' : formatTime(hour.time)}
              </div>

              {/* Weather Icon & Temp */}
              <div className="my-2 flex flex-col items-center">
                {renderWeatherIcon(weather.iconName)}
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {hour.temperature_2m}°
                </span>
              </div>

              {/* AQI Badge */}
              <div
                className={`w-full py-1 rounded-lg text-xs font-bold ${theme.badgeBg} shadow-xs`}
              >
                {hour.adjusted_aqi}
              </div>

              {/* Delta & Wind */}
              <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {hour.wind_speed_10m} km/h
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
