'use client';

import React from 'react';
import { Forecast } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import {
  Wind,
  CloudRain,
  Layers,
  Compass,
  Sun,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface CouplingBreakdownProps {
  forecast: Forecast | null;
}

export function CouplingBreakdown({ forecast }: CouplingBreakdownProps) {
  if (!forecast || !forecast.hourly.length) return null;

  const currentFactors = forecast.hourly[0]?.factors || {
    windAdjustment: 0,
    stabilityAdjustment: 0,
    precipitationAdjustment: 0,
    pressureAdjustment: 0,
    photochemicalAdjustment: 0,
    totalAdjustment: 0,
  };

  const { couplingSummary } = forecast;

  const factorItems = [
    {
      label: 'Wind Dispersion',
      delta: currentFactors.windAdjustment,
      icon: Wind,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description:
        currentFactors.windAdjustment < 0
          ? 'Strong breeze actively ventilating particulate build-up'
          : currentFactors.windAdjustment > 0
          ? 'Calm/stagnant air trapping pollutants near ground level'
          : 'Normal atmospheric mixing baseline',
    },
    {
      label: 'Precipitation Scavenging',
      delta: currentFactors.precipitationAdjustment,
      icon: CloudRain,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      description:
        currentFactors.precipitationAdjustment < 0
          ? 'Rain droplets scrubbing aerosol particulates via wet deposition'
          : 'No rain washout active currently',
    },
    {
      label: 'Boundary Inversion Proxy',
      delta: currentFactors.stabilityAdjustment,
      icon: Layers,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      description:
        currentFactors.stabilityAdjustment > 0
          ? 'Cold surface layer & high humidity forming an inversion cap'
          : 'Uncapped vertical thermal convection',
    },
    {
      label: 'Photochemical & Pressure',
      delta: currentFactors.photochemicalAdjustment + currentFactors.pressureAdjustment,
      icon: Sun,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description:
        currentFactors.pressureAdjustment > 0
          ? 'Anticyclonic high-pressure subsidence suppressing mixing'
          : 'Balanced atmospheric pressure gradient',
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Meteorological Coupling Diagnostics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Physics-informed breakdown of how local weather variables modify the air pollution curve
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50 self-start sm:self-auto">
          Driver: {couplingSummary.dominantFactor}
        </div>
      </div>

      {/* Factor Delta Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {factorItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="glass-card rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                  <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                </div>

                <div className="mt-2 flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-black ${
                      item.delta < 0
                        ? 'text-emerald-500'
                        : item.delta > 0
                        ? 'text-rose-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.delta > 0 ? `+${item.delta}` : item.delta}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">AQI delta</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-tight border-t border-slate-100 dark:border-slate-800/60 pt-2">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Optimal vs Peak Air Quality Time Windows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Cleanest Window */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40">
          <div className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
              Optimal Outdoor Window
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              Around {formatTime(couplingSummary.bestHour.time)} (AQI ~{couplingSummary.bestHour.aqi})
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Maximum convective dispersion and atmospheric clearing anticipated.
            </p>
          </div>
        </div>

        {/* Peak Pollution Hour */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
          <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Peak Pollution Period
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              Around {formatTime(couplingSummary.peakHour.time)} (AQI ~{couplingSummary.peakHour.aqi})
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Stagnant nocturnal boundary layer conditions coincide with diurnal traffic peaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
