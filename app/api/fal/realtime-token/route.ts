import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { app } = await request.json();

  if (!app) {
    return NextResponse.json({ error: 'Missing app parameter' }, { status: 400 });
  }

  if (!process.env.FAL_KEY || process.env.FAL_KEY === 'placeholder-development-value') {
    return NextResponse.json(
      { error: 'FAL_KEY not configured. Add your fal.ai API key via the Secrets page.' },
      { status: 503 }
    );
  }

  const response = await fetch('https://rest.fal.ai/tokens/realtime', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${process.env.FAL_KEY}`,
    },
    body: JSON.stringify({
      allowed_apps: [app],
      duration: 120,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to generate realtime token' },
      { status: response.status }
    );
  }

  const data = await response.json();
  return new NextResponse(data.token, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
