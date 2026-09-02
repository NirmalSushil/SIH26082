import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Air Pollution–Weather Coupled Forecast | Live Atmospheric Dashboard',
  description:
    'Real-time air quality forecasts coupled with meteorological dynamics (wind dispersion, thermal inversion, rain washout) using scientific heuristics.',
  keywords: [
    'air quality forecast',
    'weather coupled AQI',
    'PM2.5 prediction',
    'atmospheric dispersion',
    'SIH26082',
    'Open-Meteo',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
                  document.documentElement.classList.add('dark');
                } else if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
