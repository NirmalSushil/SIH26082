import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ATMOCAST | Air Pollution–Weather Coupled Forecast',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-slate-900 selection:text-white dark:selection:bg-slate-100 dark:selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
