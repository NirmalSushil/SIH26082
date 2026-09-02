'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { SearchBar } from '@/components/search-bar';
import { CurrentConditions } from '@/components/current-conditions';
import { ForecastChart } from '@/components/forecast-chart';
import { CouplingBreakdown } from '@/components/coupling-breakdown';
import { HourlyTimeline } from '@/components/hourly-timeline';
import { InsightPanel } from '@/components/insight-panel';
import { City, Forecast } from '@/lib/types';
import {
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  RefreshCw,
  Activity,
  Layers,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

export default function Home() {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme from document or localStorage
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleCitySelect = useCallback(async (city: City) => {
    setIsLoading(true);
    setError(null);
    setCurrentCity(city);

    try {
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: city.latitude,
          longitude: city.longitude,
          cityName: city.name,
          country: city.country,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          errorData.error ||
            'Unable to process atmospheric forecast for this location. Please try another city.'
        );
        return;
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        setError(data.error || 'Failed to calculate coupled forecast.');
        return;
      }

      setForecast(data.data);
    } catch (err) {
      console.error('Forecast fetch error:', err);
      setError('Connection interrupted. Please check network connectivity.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Preload initial city (London) on mount
  useEffect(() => {
    const initialCity: City = {
      id: 2643743,
      name: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      country: 'United Kingdom',
      displayName: 'London, United Kingdom',
    };
    handleCitySelect(initialCity);
  }, [handleCitySelect]);

  const handleRefresh = () => {
    if (currentCity) {
      handleCitySelect(currentCity);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Professional Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Professional Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                  ATMOCAST
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  SIH26082
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Coupled Atmospheric Dispersion & Air Quality Forecast Engine
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-1.5">
            {/* Refresh Button */}
            {currentCity && (
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-40"
                title="Refresh current forecast"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-slate-900 dark:text-slate-100' : ''}`} />
              </button>
            )}

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-slate-300" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title="Repository"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Search & Location Bar Section */}
        <section className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <SearchBar onCitySelect={handleCitySelect} isLoading={isLoading} />
        </section>

        {/* Error Notification */}
        {error && (
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-rose-900 dark:text-rose-200">{error}</span>
            </div>
            {currentCity && (
              <button
                onClick={handleRefresh}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded text-xs font-medium"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-2.5">
            <Loader2 className="w-7 h-7 animate-spin text-slate-700 dark:text-slate-300" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Computing atmospheric coupling heuristics...
            </p>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && forecast && (
          <div className="space-y-6">
            {/* Current Conditions */}
            <section>
              <CurrentConditions forecast={forecast} />
            </section>

            {/* Hourly Timeline */}
            <section>
              <HourlyTimeline forecast={forecast} />
            </section>

            {/* Interactive Charts */}
            <section>
              <ForecastChart forecast={forecast} />
            </section>

            {/* Meteorological Coupling Diagnostics */}
            <section>
              <CouplingBreakdown forecast={forecast} />
            </section>

            {/* Insights & Guidance */}
            <section>
              <InsightPanel forecast={forecast} />
            </section>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 mt-12 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              SIH26082 — Air Pollution–Weather Coupled Forecast
            </span>
            <span className="mx-2">•</span>
            <span>Real-time atmospheric modeling</span>
          </div>
          <div>
            Data sourced from{' '}
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 dark:text-slate-300 hover:underline font-medium"
            >
              Open-Meteo API
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
