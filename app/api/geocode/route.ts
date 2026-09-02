// API route: /api/geocode
// POST endpoint to geocode city names to coordinates

import { NextRequest, NextResponse } from 'next/server';
import { fetchGeocoding } from '@/lib/api-clients';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query parameter is required and must be a non-empty string',
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const cities = await fetchGeocoding(query.trim());

    return NextResponse.json(
      {
        success: true,
        data: cities,
        timestamp: new Date().toISOString(),
      } as ApiResponse<typeof cities>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Geocode API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to geocode location. Please try again.',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
