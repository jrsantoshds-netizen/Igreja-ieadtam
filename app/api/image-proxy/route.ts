import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch image');
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/png';
    return NextResponse.json({ dataUrl: `data:${mimeType};base64,${base64}` });
  } catch (error) {
    console.error('Proxy image error:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
