'use client';

import React from 'react';
import { Forecast } from '@/lib/types';
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Cloud,
  HeartPulse,
  Activity,
  Wind,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface InsightPanelProps {
  forecast: Forecast | null;
  isLoading?: boolean;
}

export function InsightPanel({ forecast, isLoading }: InsightPanelProps) {
  if (isLoading || !forecast) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl h-48 animate-pulse border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  // Calculate 12-hour trend
  const firstAqi = forecast.hourly[0]?.adjusted_aqi || 50;
  const lastAqi = forecast.hourly[Math.min(11, forecast.hourly.length - 1)]?.adjusted_aqi || 50;
  const aqiTrend = lastAqi - firstAqi;

  const getTrendInfo = () => {
    if (aqiTrend > 5) {
      return {
        icon: TrendingUp,
        label: 'Air Quality Deteriorating',
        color: 'text-rose-600 dark:text-rose-400',
        bgColor: 'bg-rose-50/80 dark:bg-rose-950/30',
        borderColor: 'border-rose-200/80 dark:border-rose-900/50',
      };
    } else if (aqiTrend < -5) {
      return {
        icon: TrendingDown,
        label: 'Air Quality Improving',
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-200/80 dark:border-emerald-900/50',
      };
    } else {
      return {
        icon: Cloud,
        label: 'Atmospheric Stability',
        color: 'text-slate-600 dark:text-slate-300',
        bgColor: 'bg-slate-50/80 dark:bg-slate-900/40',
        borderColor: 'border-slate-200/80 dark:border-slate-800',
      };
    }
  };

  const trend = getTrendInfo();
  const TrendIcon = trend.icon;

  const renderAdvisoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-5 h-5" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5" />;
      case 'Wind':
        return <Wind className="w-5 h-5" />;
      default:
        return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
      case 'caution':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'warning':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'danger':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Meteorological Intelligence & Insight
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Natural language atmospheric synthesis
            </p>
          </div>

          {/* Trend Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${trend.bgColor} ${trend.borderColor} self-start sm:self-auto`}
          >
            <TrendIcon className={`w-4 h-4 ${trend.color}`} />
            <div className="text-xs font-semibold">
              <span className={trend.color}>{trend.label}</span>{' '}
              <span className="text-slate-500 dark:text-slate-400 font-mono">
                ({aqiTrend > 0 ? `+${aqiTrend}` : aqiTrend} AQI in 12h)
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Insight Sentence Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-slate-900/80 dark:to-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
          {forecast.insight}
        </div>

        {/* Actionable Health & Lifestyle Advisories */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Actionable Health & Lifestyle Guidance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {forecast.advisories.map((adv) => (
              <div
                key={adv.category}
                className="glass-card rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs">
                      {renderAdvisoryIcon(adv.iconName)}
                      <span>{adv.category}</span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusBadge(
                        adv.status
                      )}`}
                    >
                      {adv.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-2.5">
                    {adv.title}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-normal">
                  {adv.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EPA Scale Reference Card */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
          <span>US EPA Air Quality Index Reference System</span>
          <span className="text-slate-400 font-normal">Standard 0–500 Scale</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2.5 text-center">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">0 – 50</span>
            <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Good</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-2.5 text-center">
            <span className="font-bold text-amber-700 dark:text-amber-400">51 – 100</span>
            <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Moderate</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-xl p-2.5 text-center">
            <span className="font-bold text-orange-700 dark:text-orange-400">101 – 150</span>
            <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Sensitive</div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-2.5 text-center">
            <span className="font-bold text-rose-700 dark:text-rose-400">151 – 200</span>
            <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Unhealthy</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl p-2.5 text-center">
            <span className="font-bold text-purple-700 dark:text-purple-400">201 – 300</span>
            <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Very Unhealthy</div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-2.5 text-center">
            <span className="font-bold text-red-800 dark:text-red-400">300+</span>
            <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Hazardous</div>
          </div>
        </div>
      </div>
    </div>
  );
}
