import {
  previewLumaWebhook,
  simulateLumaWebhook,
  simulateLumaRequestSchema,
} from '@/features/segmentation/server';

export async function GET(request: Request) {
  const parsed = simulateLumaRequestSchema.safeParse({
    kind: new URL(request.url).searchParams.get('kind') ?? undefined,
  });
  if (!parsed.success) return Response.json({ error: 'Invalid kind' }, { status: 400 });
  return Response.json(previewLumaWebhook(parsed.data.kind));
}

export async function POST(request: Request) {
  const parsed = simulateLumaRequestSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const result = await simulateLumaWebhook(parsed.data.kind);
    return Response.json(result.body, { status: result.status });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
