// Utility functions for formatting, weather codes, and math

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format a date to a readable time string (HH:MM)
 */
export function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return dateString;
  }
}

/**
 * Format a date to short day + hour (e.g., "Wed 14:00")
 */
export function formatShortDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${day} ${time}`;
  } catch {
    return dateString;
  }
}

/**
 * Format a date to readable full date + time string
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Round a number to specified decimal places
 */
export function round(value: number, decimals: number = 0): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Weather description and icon metadata
 */
export interface WeatherInfo {
  label: string;
  iconName: 'Sun' | 'Cloud' | 'CloudRain' | 'CloudSnow' | 'CloudLightning' | 'CloudFog';
}

/**
 * Get weather info from WMO code
 */
export function getWeatherInfo(code: number): WeatherInfo {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', iconName: 'Sun' };
    case 1:
      return { label: 'Mainly Clear', iconName: 'Sun' };
    case 2:
      return { label: 'Partly Cloudy', iconName: 'Cloud' };
    case 3:
      return { label: 'Overcast', iconName: 'Cloud' };
    case 45:
    case 48:
      return { label: 'Foggy', iconName: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { label: 'Drizzle', iconName: 'CloudRain' };
    case 61:
    case 63:
    case 65:
      return { label: 'Rain', iconName: 'CloudRain' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: 'Snowfall', iconName: 'CloudSnow' };
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', iconName: 'CloudRain' };
    case 85:
    case 86:
      return { label: 'Snow Showers', iconName: 'CloudSnow' };
    case 95:
    case 96:
    case 99:
      return { label: 'Thunderstorm', iconName: 'CloudLightning' };
    default:
      return { label: 'Clear', iconName: 'Sun' };
  }
}

export function getWeatherDescription(code: number): string {
  return getWeatherInfo(code).label;
}

/**
 * WHO / US EPA guideline thresholds for pollutants
 */
export const POLLUTANT_THRESHOLDS = {
  pm2_5: { good: 12, moderate: 35.4, unhealthy: 55.4, unit: 'µg/m³', label: 'Fine Particles' },
  pm10: { good: 54, moderate: 154, unhealthy: 254, unit: 'µg/m³', label: 'Coarse Dust' },
  ozone: { good: 54, moderate: 70, unhealthy: 85, unit: 'µg/m³', label: 'Ground Ozone' },
  nitrogen_dioxide: { good: 53, moderate: 100, unhealthy: 360, unit: 'µg/m³', label: 'Nitrogen Dioxide' },
  sulphur_dioxide: { good: 35, moderate: 75, unhealthy: 185, unit: 'µg/m³', label: 'Sulphur Dioxide' },
  carbon_monoxide: { good: 4400, moderate: 9400, unhealthy: 12400, unit: 'µg/m³', label: 'Carbon Monoxide' },
};
