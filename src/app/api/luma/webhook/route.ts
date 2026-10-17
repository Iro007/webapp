import { handleLumaWebhook } from '@/features/segmentation/server';

export async function POST(request: Request) {
  try {
    const result = await handleLumaWebhook(await request.text(), request.headers);
    return Response.json(result.body, { status: result.status });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
