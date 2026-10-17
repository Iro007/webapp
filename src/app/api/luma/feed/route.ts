import { readLumaFeed } from '@/features/segmentation/server';

export async function GET(request: Request) {
  const after = Number(new URL(request.url).searchParams.get('after') ?? 0);
  return Response.json(readLumaFeed(Number.isFinite(after) ? after : 0));
}
