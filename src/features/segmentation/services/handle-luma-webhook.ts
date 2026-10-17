import 'server-only';
import type { LumaFeedEntry } from '../types/luma-feed.types';
import { lumaWebhookSchema } from '../types/luma.schema';
import { applyTrigger } from './apply-trigger';
import { LumaFeedStore } from './luma-feed-store';
import { profileFromLuma } from './luma-mapping';
import { verifyWebhook } from './luma-signature';
import { segmentProfile } from './segment-profile';

export type WebhookResult =
  | { status: 200; body: { ok: true; duplicate?: boolean; entry?: Omit<LumaFeedEntry, 'seq'> } }
  | { status: 400 | 401; body: { ok: false; error: string } };

export async function handleLumaWebhook(rawBody: string, headers: Headers): Promise<WebhookResult> {
  const check = verifyWebhook(rawBody, headers.get('webhook-signature'));
  if (!check.ok) {
    LumaFeedStore.markRejected();
    return { status: 401, body: { ok: false, error: check.reason } };
  }

  const webhookId = headers.get('webhook-id') ?? '';
  if (!webhookId) return { status: 400, body: { ok: false, error: 'Missing webhook-id' } };
  if (!LumaFeedStore.markSeen(webhookId))
    return { status: 200, body: { ok: true, duplicate: true } };

  const parsed = lumaWebhookSchema.safeParse(JSON.parse(rawBody));
  if (!parsed.success) return { status: 400, body: { ok: false, error: 'Unsupported payload' } };
  const { type, data } = parsed.data;

  if (type === 'guest.registered') {
    const profile = profileFromLuma(data.event, data.guest);
    LumaFeedStore.saveGuest(data.event, data.guest, profile);
    const outcome = await segmentProfile(profile, 'sign_up');
    const entry = { webhookId, type, receivedAt: new Date().toISOString(), profile, outcome };
    LumaFeedStore.push(entry);
    return { status: 200, body: { ok: true, entry } };
  }

  const stored = LumaFeedStore.findGuest(data.guest.api_id);
  if (!stored || !data.guest.checked_in_at || stored.guest.checked_in_at) {
    return { status: 200, body: { ok: true } };
  }
  const profile = applyTrigger(stored.profile, 'attended_event');
  LumaFeedStore.saveGuest(data.event, data.guest, profile);
  const outcome = await segmentProfile(profile, 'attended_event');
  const entry = { webhookId, type, receivedAt: new Date().toISOString(), profile, outcome };
  LumaFeedStore.push(entry);
  return { status: 200, body: { ok: true, entry } };
}
