# Local Setup Instructions

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** version 18.17 or later (download from https://nodejs.org/)
- **npm** version 9+ (comes with Node.js) or **pnpm** (optional)
- **Git** (for version control)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Verify Installation

```bash
node --version    # Should be v18.17.0 or higher
npm --version     # Should be 9.0.0 or higher
git --version     # Should be 2.30.0 or higher
```

---

## Installation Steps

### 1. Clone or Download the Project

```bash
# Clone from Git repository (if available)
git clone https://github.com/yourusername/air-pollution-forecast.git
cd air-pollution-forecast

# OR

# If using a ZIP download
unzip air-pollution-forecast.zip
cd air-pollution-forecast
```

### 2. Install Dependencies

```bash
# Using npm (default)
npm install

# OR using pnpm (if preferred)
pnpm install
```

This installs all required packages from `package.json`:
- Next.js 16+
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts for charts
- SWR or React Query for data fetching
- lucide-react for icons

**Expected time:** 2–5 minutes depending on network speed

### 3. Create Environment Variables (Optional)

If using the **WAQI API** for fallback/cross-checking (optional):

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your WAQI token
# NEXT_PUBLIC_WAQI_TOKEN=your_token_here
```

**Note:** The main forecast uses Open-Meteo which requires **no API keys**. WAQI is completely optional for fallback purposes.

---

## Running the Development Server

### Start the Dev Server

```bash
npm run dev
```

This starts the Next.js development server with:
- Hot module reloading (changes auto-reflect)
- TypeScript type checking
- Tailwind CSS JIT compilation

**Output:**

```
> air-pollution-forecast@1.0.0 dev
> next dev

  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.3s
```

### Visit the App

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the dashboard with a search bar. Try searching for any city (e.g., "London", "Tokyo", "New York").

---

## Project Structure

```
air-pollution-forecast/
├── docs/                       # Documentation
│   ├── README.md
│   ├── architecture.md
│   ├── api-integration.md
│   ├── forecasting-model.md
│   ├── setup.md               (this file)
│   └── deployment.md
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout, global styles
│   │   ├── page.tsx           # Main dashboard
│   │   └── api/               # API routes
│   │       ├── geocode.ts     # City → lat/lon
│   │       └── forecast.ts    # Aggregated forecast endpoint
│   ├── components/            # React components
│   │   ├── search-bar.tsx
│   │   ├── current-conditions.tsx
│   │   ├── forecast-chart.tsx
│   │   ├── insight-panel.tsx
│   │   └── error-boundary.tsx
│   ├── lib/                   # Utilities & logic
│   │   ├── api-clients.ts     # API fetch functions
│   │   ├── forecast.ts        # Coupling function
│   │   └── types.ts           # TypeScript types
│   └── styles/                # Global styles (if any)
├── public/                    # Static assets
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind configuration
├── .env.example               # Environment variable template
└── README.md                  # Project README
```

---

## Development Workflow

### Adding a New Component

1. Create file in `src/components/MyComponent.tsx`:

```typescript
import React from 'react';

export function MyComponent() {
  return (
    <div className="p-4">
      {/* Your JSX here */}
    </div>
  );
}
```

2. Import and use in `src/app/page.tsx`:

```typescript
import { MyComponent } from '@/components/MyComponent';

export default function Home() {
  return <MyComponent />;
}
```

3. Save — the dev server hot-reloads automatically.

### Adding a New API Route

1. Create file in `src/app/api/my-endpoint.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

2. Call from frontend:

```typescript
const response = await fetch('/api/my-endpoint');
const data = await response.json();
```

### Updating Tailwind Styles

Tailwind classes are JIT-compiled during dev. Just use any Tailwind class in your JSX:

```jsx
<div className="bg-slate-900 text-white p-4 rounded-lg shadow-lg">
  {/* Tailwind auto-generates the CSS */}
</div>
```

No need to restart the server for style changes.

---

## Building for Production

### Create a Production Build

```bash
npm run build
```

**Output:**

```
> next build

▲ Next.js 16.0.0

✓ Compiled successfully
✓ Linting
✓ Collecting page data
✓ Generating static pages (5/5)
✓ Finalizing page optimization

Route (pages)                              Size
┌ ○ /                                    42.1 kB
└─ ○ /404                                3.9 kB

```

The build creates an optimized production bundle in `.next/` directory.

### Start the Production Server Locally

```bash
npm start
```

This starts the production server on `http://localhost:3000` with:
- Optimized bundle
- Server-side rendering
- Static page generation where applicable

---

## Debugging

### Browser DevTools

Use browser DevTools to inspect the React component tree, network requests, and logs:

1. Press `F12` (or `Ctrl+Shift+I` / `Cmd+Option+I`)
2. Go to **Network** tab to see API calls to Open-Meteo
3. Go to **Console** tab to see any JavaScript errors
4. Go to **Elements/Inspector** to inspect HTML and CSS

### Server Logs

Check the terminal running `npm run dev` for server-side errors and warnings:

```
GET /api/forecast?latitude=51.5085&longitude=-0.1257 200 in 245ms
```

### TypeScript Errors

The dev server displays TypeScript errors in the terminal and browser:

```
error TS2339: Property 'foo' does not exist on type 'bar'
  at src/components/MyComponent.tsx:5:10
```

Fix the error and save — the build will re-attempt automatically.

---

## Testing

### Manual Testing Checklist

- [ ] Search for a city (e.g., "London") — should show results
- [ ] Click a result — dashboard should update with forecast
- [ ] View current conditions card — shows AQI, temperature, wind, humidity
- [ ] View forecast chart — shows raw and adjusted AQI lines + weather driver
- [ ] Hover chart — tooltip shows values at that timestamp
- [ ] Try another city — search clears and new forecast loads
- [ ] Open on mobile (DevTools: Device Emulation) — layout should stack vertically
- [ ] Disable JavaScript in DevTools — error message shows (not critical, but nice to have)

### Testing Different Cities

```
London, UK
Tokyo, Japan
Delhi, India
Los Angeles, USA
São Paulo, Brazil
Beijing, China
```

These cities have varying air quality levels, which tests the AQI color-coding.

---

## Troubleshooting

### Issue: "Port 3000 already in use"

**Solution:** Kill the process or use a different port:

```bash
# Use a different port
npm run dev -- -p 3001
# Now visit http://localhost:3001
```

### Issue: "Cannot find module '@/components/...'"

**Solution:** Check the TypeScript import path. The `@/` alias is configured in `tsconfig.json` to point to `src/`.

### Issue: API calls failing (console shows 404 or CORS error)

**Solution:** 
1. Verify `src/app/api/forecast.ts` exists
2. Check the network tab in DevTools for the actual URL being called
3. Ensure external APIs (Open-Meteo) are not blocked by firewall/proxy

### Issue: Tailwind styles not applying

**Solution:**
1. Verify `tailwind.config.ts` includes `src/**/*.{js,ts,jsx,tsx}`
2. Restart dev server: `npm run dev`
3. Clear browser cache: `Ctrl+Shift+Delete` → Clear cache → Hard refresh `Ctrl+Shift+R`

### Issue: npm install fails with version conflicts

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -r node_modules package-lock.json

# Reinstall
npm install

# If still failing, try npm cache clean
npm cache clean --force
npm install
```

---

## Next Steps

Once the dev server is running:

1. **Review the docs:** Read through `/docs/` to understand the architecture and API integration
2. **Explore the code:** Start with `src/app/page.tsx` to understand the main flow
3. **Make changes:** Modify components and see hot-reload in action
4. **Test API calls:** Use browser DevTools Network tab to inspect Open-Meteo requests
5. **Deploy:** When ready, follow `/docs/deployment.md` to deploy to Vercel

---

## Additional Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/
- **Recharts:** https://recharts.org/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Open-Meteo API:** https://open-meteo.com/en/docs

---

## Getting Help

- **Console Errors:** Check browser DevTools Console for detailed error messages
- **Type Errors:** TypeScript will highlight issues in your editor (VS Code)
- **API Issues:** Test endpoints directly with `curl` (see `/docs/api-integration.md`)
- **Deployment Issues:** See `/docs/deployment.md` for Vercel-specific guidance

---

## Summary

You're all set! The dev server is running, hot-reload is active, and you can start building. Happy coding! 🚀
