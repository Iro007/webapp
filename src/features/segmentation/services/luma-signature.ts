import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

const TOLERANCE_SECONDS = 5 * 60;

export const DEMO_WEBHOOK_SECRET = 'whsec_demo_simulated_luma';

export function webhookSecret() {
  return process.env.LUMA_WEBHOOK_SECRET || DEMO_WEBHOOK_SECRET;
}

function hmac(secret: string, timestamp: string, rawBody: string) {
  return createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
}

export function signWebhook(rawBody: string, secret = webhookSecret(), now = Date.now()) {
  const timestamp = String(Math.floor(now / 1000));
  return {
    'webhook-id': `msg_${crypto.randomUUID().replaceAll('-', '')}`,
    'webhook-timestamp': timestamp,
    'webhook-signature': `t=${timestamp},v1=${hmac(secret, timestamp, rawBody)}`,
  };
}

export type SignatureCheck = { ok: true } | { ok: false; reason: string };

export function verifyWebhook(
  rawBody: string,
  signatureHeader: string | null,
  secret = webhookSecret(),
  now = Date.now(),
): SignatureCheck {
  if (!signatureHeader) return { ok: false, reason: 'Missing Webhook-Signature header' };
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => part.trim().split('=') as [string, string]),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return { ok: false, reason: 'Malformed signature header' };
  if (Math.abs(now / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) {
    return { ok: false, reason: 'Timestamp outside the 5 minute tolerance' };
  }

  const expected = Buffer.from(hmac(secret, timestamp, rawBody), 'hex');
  const received = Buffer.from(signature, 'hex');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, reason: 'Signature does not match' };
  }
  return { ok: true };
}
