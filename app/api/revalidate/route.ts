// Path: app/api/revalidate/route.ts

import { revalidate } from 'lib/data';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  return revalidate(req);
}
