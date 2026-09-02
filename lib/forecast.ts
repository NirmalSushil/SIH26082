// Weather-Pollution Coupling Forecast Model
// Pure mathematical functions for computing adjusted AQI based on meteorological dynamics

import {
  WeatherHourly,
  AirQualityHourly,
  ForecastHour,
  Forecast,
  City,
  CouplingFactors,
  CouplingSummary,
  HealthAdvisory,
  getAQISeverity,
} from '@/lib/types';

/**
 * Compute wind dispersion adjustment
 * Calm/stagnant air traps pollutants; strong breeze disperses them
 */
function computeWindAdjustment(windSpeed: number, windGusts?: number): number {
  const effectiveWind = windGusts ? windSpeed * 0.7 + windGusts * 0.3 : windSpeed;

  if (effectiveWind < 3) return 10; // Severe stagnation
  if (effectiveWind < 7) return 4; // Weak ventilation
  if (effectiveWind < 14) return 0; // Baseline mixing
  if (effectiveWind < 22) return -5; // Moderate dispersion
  if (effectiveWind < 32) return -9; // Strong dispersion
  return -12; // High-velocity dispersion
}

/**
 * Compute stability / thermal inversion adjustment
 * Cold + humid conditions create low-level inversions trapping particulate matter
 */
function computeStabilityAdjustment(
  temperature: number,
  humidity: number
): number {
  if (temperature < 5 && humidity > 85) return 9; // Severe ground inversion
  if (temperature < 12 && humidity > 75) return 5; // Moderate inversion
  if (temperature > 22 && humidity < 40) return -4; // Strong convective mixing
  if (temperature > 18 && humidity < 50) return -2; // Good vertical mixing
  return 0; // Neutral stability
}

/**
 * Compute precipitation washout (wet deposition)
 * Rain droplets scavenge particulate matter and soluble gases
 */
function computePrecipitationAdjustment(precipitation: number): number {
  if (precipitation >= 5.0) return -18; // Heavy rain scouring
  if (precipitation >= 2.0) return -11; // Moderate rain washout
  if (precipitation >= 0.5) return -6; // Light rain washout
  if (precipitation > 0) return -2; // Trace drizzle
  return 0;
}

/**
 * Compute photochemical reaction modifier
 * Warm temperatures and moderate humidity promote secondary ozone / photochemical smog
 */
function computePhotochemicalAdjustment(
  temperature: number,
  humidity: number
): number {
  if (temperature > 28 && humidity >= 35 && humidity <= 65) return 6; // High photochemical activity
  if (temperature > 24 && humidity >= 40 && humidity <= 70) return 3; // Moderate ozone generation
  if (humidity > 88 && temperature > 15) return 4; // Secondary sulfate/nitrate aerosol swelling
  return 0;
}

/**
 * Compute barometric pressure tendency adjustment
 * Anticyclones (high pressure) produce subsidence; low-pressure systems enhance turbulence
 */
function computePressureAdjustment(
  currentPressure: number,
  previousPressure: number | null
): number {
  let pressureLevelAdj = 0;
  if (currentPressure > 1022) pressureLevelAdj += 3; // Strong anticyclonic subsidence
  else if (currentPressure < 1006) pressureLevelAdj -= 3; // Cyclonic upward motion

  if (previousPressure === null) return pressureLevelAdj;

  const pressureTrend = currentPressure - previousPressure;
  let trendAdj = 0;
  if (pressureTrend > 2) trendAdj = 2; // Rapidly building ridge
  else if (pressureTrend < -2) trendAdj = -2; // Incoming trough / front

  return Math.max(-4, Math.min(4, pressureLevelAdj + trendAdj));
}

/**
 * Main coupling function: computes adjusted AQI with transparent factor accounting
 */
export function computeCoupledForecast(
  weatherHourly: WeatherHourly,
  aqiHourly: AirQualityHourly
): ForecastHour[] {
  const forecast: ForecastHour[] = [];
  const hoursCount = Math.min(
    aqiHourly.time?.length || 0,
    weatherHourly.time?.length || 0,
    48
  );

  for (let i = 0; i < hoursCount; i++) {
    const time = aqiHourly.time[i] || weatherHourly.time[i];
    const rawAqi = Math.round(aqiHourly.us_aqi?.[i] ?? 50);

    const temperature = weatherHourly.temperature_2m?.[i] ?? 18;
    const humidity = weatherHourly.relative_humidity_2m?.[i] ?? 50;
    const windSpeed = weatherHourly.wind_speed_10m?.[i] ?? 8;
    const windGusts = weatherHourly.wind_gusts_10m?.[i] ?? windSpeed * 1.3;
    const precipitation = weatherHourly.precipitation?.[i] ?? 0;
    const pressure = weatherHourly.pressure_msl?.[i] ?? 1013;
    const previousPressure =
      i > 0 ? weatherHourly.pressure_msl?.[i - 1] ?? null : null;
    const weatherCode = weatherHourly.weather_code?.[i] ?? 0;

    // Calculate individual heuristic factor components
    const windAdj = computeWindAdjustment(windSpeed, windGusts);
    const stabilityAdj = computeStabilityAdjustment(temperature, humidity);
    const precipAdj = computePrecipitationAdjustment(precipitation);
    const photochemAdj = computePhotochemicalAdjustment(temperature, humidity);
    const pressureAdj = computePressureAdjustment(pressure, previousPressure);

    // Cumulative delta clamped within reasonable bounds
    let rawTotalDelta =
      windAdj + stabilityAdj + precipAdj + photochemAdj + pressureAdj;
    
    // Smooth delta by not swinging more than 40% of baseline raw AQI
    const maxDelta = Math.max(12, Math.round(rawAqi * 0.45));
    const totalAdjustment = Math.max(-maxDelta, Math.min(maxDelta, rawTotalDelta));

    // Adjusted AQI must be positive
    const adjustedAqi = Math.max(5, rawAqi + totalAdjustment);

    const factors: CouplingFactors = {
      windAdjustment: windAdj,
      stabilityAdjustment: stabilityAdj,
      precipitationAdjustment: precipAdj,
      pressureAdjustment: pressureAdj,
      photochemicalAdjustment: photochemAdj,
      totalAdjustment,
    };

    forecast.push({
      time,
      raw_aqi: rawAqi,
      adjusted_aqi: Math.round(adjustedAqi),
      delta_aqi: Math.round(adjustedAqi) - rawAqi,
      temperature_2m: Math.round(temperature * 10) / 10,
      relative_humidity_2m: Math.round(humidity),
      wind_speed_10m: Math.round(windSpeed * 10) / 10,
      wind_gusts_10m: Math.round(windGusts * 10) / 10,
      precipitation: Math.round(precipitation * 10) / 10,
      pressure_msl: Math.round(pressure * 10) / 10,
      weather_code: weatherCode,
      pm2_5: Math.round((aqiHourly.pm2_5?.[i] ?? 10) * 10) / 10,
      pm10: Math.round((aqiHourly.pm10?.[i] ?? 20) * 10) / 10,
      ozone: aqiHourly.ozone?.[i] ? Math.round(aqiHourly.ozone[i] * 10) / 10 : undefined,
      nitrogen_dioxide: aqiHourly.nitrogen_dioxide?.[i]
        ? Math.round(aqiHourly.nitrogen_dioxide[i] * 10) / 10
        : undefined,
      sulphur_dioxide: aqiHourly.sulphur_dioxide?.[i]
        ? Math.round(aqiHourly.sulphur_dioxide[i] * 10) / 10
        : undefined,
      carbon_monoxide: aqiHourly.carbon_monoxide?.[i]
        ? Math.round(aqiHourly.carbon_monoxide[i] * 10) / 10
        : undefined,
      factors,
    });
  }

  return forecast;
}

/**
 * Identify dominant pollutant
 */
function getDominantPollutant(current: any): string {
  const pm25 = current?.pm2_5 ?? 0;
  const pm10 = current?.pm10 ?? 0;
  const o3 = current?.ozone ?? 0;
  const no2 = current?.nitrogen_dioxide ?? 0;

  if (pm25 > 35) return 'PM2.5';
  if (pm10 > 50) return 'PM10';
  if (o3 > 100) return 'Ozone (O₃)';
  if (no2 > 50) return 'NO₂';
  return 'PM2.5';
}

/**
 * Generate coupling summary analytics
 */
export function generateCouplingSummary(
  forecastHours: ForecastHour[]
): CouplingSummary {
  if (!forecastHours.length) {
    return {
      dominantFactor: 'Neutral atmospheric conditions',
      dispersionRating: 'Moderate',
      inversionRisk: 'Low',
      washoutEffect: 'None',
      averageAdjustment: 0,
      peakHour: { time: '', aqi: 0 },
      bestHour: { time: '', aqi: 0 },
    };
  }

  const next24 = forecastHours.slice(0, 24);

  // Peak & Best hours
  let peakHour = next24[0];
  let bestHour = next24[0];

  let totalAdjustmentSum = 0;
  let windSpeedSum = 0;
  let maxPrecip = 0;
  let maxInversionSignal = 0;

  for (const h of next24) {
    if (h.adjusted_aqi > peakHour.adjusted_aqi) peakHour = h;
    if (h.adjusted_aqi < bestHour.adjusted_aqi) bestHour = h;

    totalAdjustmentSum += h.delta_aqi;
    windSpeedSum += h.wind_speed_10m;
    if (h.precipitation > maxPrecip) maxPrecip = h.precipitation;
    if (h.factors.stabilityAdjustment > maxInversionSignal)
      maxInversionSignal = h.factors.stabilityAdjustment;
  }

  const avgWind = windSpeedSum / next24.length;
  const avgAdj = totalAdjustmentSum / next24.length;

  let dispersionRating: 'Poor' | 'Moderate' | 'Good' | 'Excellent' = 'Moderate';
  if (avgWind < 4) dispersionRating = 'Poor';
  else if (avgWind < 10) dispersionRating = 'Moderate';
  else if (avgWind < 20) dispersionRating = 'Good';
  else dispersionRating = 'Excellent';

  let inversionRisk: 'Low' | 'Moderate' | 'High' = 'Low';
  if (maxInversionSignal >= 7) inversionRisk = 'High';
  else if (maxInversionSignal >= 4) inversionRisk = 'Moderate';

  let washoutEffect: 'None' | 'Light' | 'Moderate' | 'Strong' = 'None';
  if (maxPrecip >= 4) washoutEffect = 'Strong';
  else if (maxPrecip >= 1.5) washoutEffect = 'Moderate';
  else if (maxPrecip > 0.1) washoutEffect = 'Light';

  // Dominant meteorological driver
  let dominantFactor = 'Balanced atmospheric mixing';
  if (maxPrecip >= 1.5) {
    dominantFactor = `Precipitation wet scavenging (-${Math.abs(Math.round(avgAdj))} AQI)`;
  } else if (avgWind >= 16) {
    dominantFactor = `Strong wind convective dispersion (-${Math.abs(Math.round(avgAdj))} AQI)`;
  } else if (avgWind < 5) {
    dominantFactor = `Calm wind stagnation (+${Math.round(Math.abs(avgAdj))} AQI)`;
  } else if (inversionRisk === 'High') {
    dominantFactor = `Boundary layer thermal inversion (+${Math.round(Math.abs(avgAdj))} AQI)`;
  }

  return {
    dominantFactor,
    dispersionRating,
    inversionRisk,
    washoutEffect,
    averageAdjustment: Math.round(avgAdj * 10) / 10,
    peakHour: {
      time: peakHour.time,
      aqi: peakHour.adjusted_aqi,
    },
    bestHour: {
      time: bestHour.time,
      aqi: bestHour.adjusted_aqi,
    },
  };
}

/**
 * Generate context-aware plain language forecast insight
 */
export function generateInsightSentence(
  forecast: ForecastHour[],
  summary: CouplingSummary
): string {
  if (!forecast || forecast.length === 0) {
    return 'Atmospheric forecast data is currently unavailable.';
  }

  const next12 = forecast.slice(0, 12);
  const startAqi = next12[0]?.adjusted_aqi ?? 50;
  const endAqi = next12[next12.length - 1]?.adjusted_aqi ?? 50;
  const trend = endAqi - startAqi;

  const windAvg =
    next12.reduce((acc, h) => acc + h.wind_speed_10m, 0) / next12.length;
  const hasRain = next12.some((h) => h.precipitation >= 0.5);

  let sentence = '';

  if (hasRain) {
    sentence = `Anticipated rainfall will actively scrub suspended particulates from the lower troposphere, driving a marked improvement in air quality across the coming hours.`;
  } else if (windAvg > 16) {
    sentence = `Brisk surface ventilation (${Math.round(windAvg)} km/h) is accelerating pollutant dispersion, sustaining favorable air quality levels despite localized emissions.`;
  } else if (summary.inversionRisk === 'High' || windAvg < 4) {
    sentence = `Thermal inversion and weak surface airflow are suppressing vertical mixing, trapping particulates near ground level and causing AQI to peak around ${new Date(summary.peakHour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
  } else if (trend < -10) {
    sentence = `Air quality is projected to steadily improve by ${Math.abs(trend)} AQI points over the next 12 hours as atmospheric mixing conditions strengthen.`;
  } else if (trend > 10) {
    sentence = `Pollution concentrations are expected to build up over the next 12 hours (+${trend} AQI points) due to decreasing wind speeds and nocturnal cooling.`;
  } else {
    sentence = `Atmospheric conditions remain stable with balanced dispersion, keeping air quality within the ${getAQISeverity(startAqi)} range throughout the forecast period.`;
  }

  return sentence;
}

/**
 * Generate actionable health and activity advisories
 */
export function generateHealthAdvisories(
  currentAqi: number,
  forecast: ForecastHour[]
): HealthAdvisory[] {
  const advisories: HealthAdvisory[] = [];

  // Outdoor Exercise
  if (currentAqi <= 50) {
    advisories.push({
      category: 'Outdoor Exercise',
      status: 'safe',
      title: 'Ideal for Outdoor Workouts',
      recommendation: 'Air quality is pristine. Perfect for running, cycling, and vigorous outdoor activities.',
      iconName: 'Activity',
    });
  } else if (currentAqi <= 100) {
    advisories.push({
      category: 'Outdoor Exercise',
      status: 'caution',
      title: 'Acceptable for Exercise',
      recommendation: 'Most people can exercise outdoors safely. Unusually sensitive individuals should monitor exertion.',
      iconName: 'Activity',
    });
  } else if (currentAqi <= 150) {
    advisories.push({
      category: 'Outdoor Exercise',
      status: 'warning',
      title: 'Reduce Heavy Exertion',
      recommendation: 'Sensitive individuals and athletes should take frequent breaks and consider indoor alternatives.',
      iconName: 'Activity',
    });
  } else {
    advisories.push({
      category: 'Outdoor Exercise',
      status: 'danger',
      title: 'Avoid Strenuous Activity',
      recommendation: 'Move workouts indoors. High particulate levels can trigger respiratory distress during heavy breathing.',
      iconName: 'Activity',
    });
  }

  // Sensitive Groups
  if (currentAqi <= 100) {
    advisories.push({
      category: 'Sensitive Groups',
      status: 'safe',
      title: 'Low Risk for Asthmatics & Children',
      recommendation: 'Conditions are favorable for children, the elderly, and individuals with respiratory conditions.',
      iconName: 'HeartPulse',
    });
  } else if (currentAqi <= 150) {
    advisories.push({
      category: 'Sensitive Groups',
      status: 'warning',
      title: 'Precaution Advised',
      recommendation: 'People with asthma or cardiovascular conditions should keep rescue medication handy.',
      iconName: 'HeartPulse',
    });
  } else {
    advisories.push({
      category: 'Sensitive Groups',
      status: 'danger',
      title: 'High Health Risk',
      recommendation: 'Children, seniors, and individuals with lung/heart disease should stay indoors in filtered air.',
      iconName: 'HeartPulse',
    });
  }

  // Home Ventilation
  const hasInversion = forecast.slice(0, 8).some((h) => h.factors.stabilityAdjustment > 4);
  if (currentAqi <= 50 && !hasInversion) {
    advisories.push({
      category: 'Ventilation',
      status: 'safe',
      title: 'Great Window Ventilation',
      recommendation: 'Open windows to circulate fresh, clean outdoor air throughout living spaces.',
      iconName: 'Wind',
    });
  } else if (currentAqi <= 120) {
    advisories.push({
      category: 'Ventilation',
      status: 'caution',
      title: 'Selective Ventilation',
      recommendation: 'Ventilate during peak wind hours (mid-day) when ground-level pollution is dispersed.',
      iconName: 'Wind',
    });
  } else {
    advisories.push({
      category: 'Ventilation',
      status: 'danger',
      title: 'Keep Windows Closed',
      recommendation: 'Keep windows sealed and operate HEPA air purifiers to prevent outdoor soot infiltration.',
      iconName: 'Wind',
    });
  }

  return advisories;
}

/**
 * Assemble complete forecast payload
 */
export function buildForecast(
  city: City,
  weatherData: any,
  airQualityData: any,
  forecastHours: ForecastHour[]
): Forecast {
  const currentRawAqi = Math.round(airQualityData?.current?.us_aqi || 50);
  const firstHour = forecastHours[0] || null;
  const currentAdjustedAqi = firstHour ? firstHour.adjusted_aqi : currentRawAqi;

  const currentPollutants = {
    pm2_5: Math.round((airQualityData?.current?.pm2_5 || 0) * 10) / 10,
    pm10: Math.round((airQualityData?.current?.pm10 || 0) * 10) / 10,
    ozone: Math.round((airQualityData?.current?.ozone || 0) * 10) / 10,
    nitrogen_dioxide: Math.round((airQualityData?.current?.nitrogen_dioxide || 0) * 10) / 10,
    sulphur_dioxide: Math.round((airQualityData?.current?.sulphur_dioxide || 0) * 10) / 10,
    carbon_monoxide: Math.round((airQualityData?.current?.carbon_monoxide || 0) * 10) / 10,
  };

  const couplingSummary = generateCouplingSummary(forecastHours);
  const insight = generateInsightSentence(forecastHours, couplingSummary);
  const advisories = generateHealthAdvisories(currentAdjustedAqi, forecastHours);

  return {
    city,
    current: {
      aqi: currentRawAqi,
      adjusted_aqi: currentAdjustedAqi,
      delta_aqi: currentAdjustedAqi - currentRawAqi,
      severity: getAQISeverity(currentAdjustedAqi),
      dominant_pollutant: getDominantPollutant(currentPollutants),
      temperature_2m: Math.round((weatherData?.current?.temperature_2m || 0) * 10) / 10,
      apparent_temperature: Math.round(
        (weatherData?.current?.apparent_temperature || weatherData?.current?.temperature_2m || 0) * 10
      ) / 10,
      humidity: Math.round(weatherData?.current?.relative_humidity_2m || 0),
      wind_speed: Math.round((weatherData?.current?.wind_speed_10m || 0) * 10) / 10,
      wind_gusts: Math.round((weatherData?.current?.wind_gusts_10m || 0) * 10) / 10,
      precipitation: Math.round((weatherData?.current?.precipitation || 0) * 10) / 10,
      pressure: Math.round((weatherData?.current?.pressure_msl || 1013) * 10) / 10,
      weather_code: weatherData?.current?.weather_code || 0,
      ...currentPollutants,
    },
    hourly: forecastHours,
    insight,
    couplingSummary,
    advisories,
    fetchedAt: new Date().toISOString(),
  };
}
