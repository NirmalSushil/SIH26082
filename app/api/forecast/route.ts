// API route: /api/forecast
// POST endpoint to compute coupled weather-pollution forecast

import { NextRequest, NextResponse } from 'next/server';
import { fetchForecastData } from '@/lib/api-clients';
import { computeCoupledForecast, buildForecast } from '@/lib/forecast';
import { City, ApiResponse, Forecast } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, cityName, country } = body;

    // Validate coordinates
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates provided. Latitude must be between -90 and 90, longitude between -180 and 180.',
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Fetch atmospheric observation with guaranteed fallback
    const forecastData = await fetchForecastData(latitude, longitude);

    // Compute coupled forecast with heuristic modifiers
    const forecastHours = computeCoupledForecast(
      forecastData.weather.hourly,
      forecastData.airQuality.hourly
    );

    // Build city object
    const finalCityName = cityName || `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
    const finalCountry = country || '';

    const city: City = {
      id: Math.floor(Math.random() * 1000000),
      name: finalCityName,
      latitude,
      longitude,
      country: finalCountry,
      displayName: finalCountry ? `${finalCityName}, ${finalCountry}` : finalCityName,
    };

    const forecast = buildForecast(
      city,
      forecastData.weather,
      forecastData.airQuality,
      forecastHours
    );

    return NextResponse.json(
      {
        success: true,
        data: forecast,
        timestamp: new Date().toISOString(),
      } as ApiResponse<Forecast>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Forecast API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process forecast request. Please try again.',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
