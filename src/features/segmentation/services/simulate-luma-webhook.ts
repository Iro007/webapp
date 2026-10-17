import 'server-only';
import { handleLumaWebhook } from './handle-luma-webhook';
import { LumaFeedStore } from './luma-feed-store';
import { signWebhook } from './luma-signature';
import { nextSimulatedWebhook, type SimulationKind } from './luma-simulator';

export async function simulateLumaWebhook(kind: SimulationKind) {
  const rawBody = JSON.stringify(nextSimulatedWebhook(kind));
  return handleLumaWebhook(rawBody, new Headers(signWebhook(rawBody)));
}

export function previewLumaWebhook(kind: SimulationKind) {
  return nextSimulatedWebhook(kind);
}

export function readLumaFeed(afterSeq: number) {
  return LumaFeedStore.read(afterSeq);
}
