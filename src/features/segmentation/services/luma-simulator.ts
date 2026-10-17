import 'server-only';
import { fictionalPerson, SIMULATED_EVENTS } from '../mocks/fictional-guests';
import { generateSignUp } from '../mocks/generate-sign-up';
import type { LumaWebhook } from '../types/luma.schema';
import { LumaFeedStore } from './luma-feed-store';
import { registrationAnswers } from './luma-mapping';

export type SimulationKind = 'registration' | 'check_in' | 'auto';

const CHECK_IN_SHARE = 0.3;

const counter = globalThis as typeof globalThis & { lumaDemoSeed?: number };

function nextSeed() {
  counter.lumaDemoSeed = (counter.lumaDemoSeed ?? Math.floor(Math.random() * 1000)) + 1;
  return counter.lumaDemoSeed;
}

function registration(): LumaWebhook {
  const seed = nextSeed();
  const signUp = generateSignUp(seed);
  const event = SIMULATED_EVENTS[seed % SIMULATED_EVENTS.length] ?? SIMULATED_EVENTS[0];
  if (!event) throw new Error('No simulated events');
  const person = fictionalPerson(seed);

  return {
    type: 'guest.registered',
    data: {
      event: { ...event },
      guest: {
        api_id: `gst-sim${seed.toString(36)}${Date.now().toString(36).slice(-4)}`,
        event_api_id: event.api_id,
        user_name: person.name,
        user_email: person.email,
        approval_status: 'approved',
        registered_at: new Date().toISOString(),
        checked_in_at: null,
        registration_answers: registrationAnswers({ ...signUp, event: event.name }),
      },
    },
  };
}

function checkIn(): LumaWebhook | null {
  const stored = LumaFeedStore.randomGuest(Math.random());
  if (!stored) return null;
  return {
    type: 'guest.updated',
    data: {
      event: stored.event,
      guest: { ...stored.guest, checked_in_at: new Date().toISOString() },
    },
  };
}

export function nextSimulatedWebhook(kind: SimulationKind): LumaWebhook {
  const wantsCheckIn = kind === 'check_in' || (kind === 'auto' && Math.random() < CHECK_IN_SHARE);
  return (wantsCheckIn ? checkIn() : null) ?? registration();
}
