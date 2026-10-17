import 'server-only';
import type { LumaFeed, LumaFeedEntry } from '../types/luma-feed.types';
import type { LumaEvent, LumaGuest } from '../types/luma.schema';
import type { Profile } from '../types/segmentation.types';

interface StoredGuest {
  guest: LumaGuest;
  event: LumaEvent;
  profile: Profile;
}

interface FeedState {
  entries: LumaFeedEntry[];
  guests: Map<string, StoredGuest>;
  events: Map<string, LumaEvent>;
  seenWebhookIds: Set<string>;
  seq: number;
  rejected: number;
  duplicates: number;
}

const MAX_ENTRIES = 500;

const globalStore = globalThis as typeof globalThis & { lumaDemoFeed?: FeedState };

// NOTE: in-memory on purpose. It survives hot reloads in `next dev` and a single `next start` process,
// which is all the event demo needs; production would persist this in a database.
const state: FeedState = (globalStore.lumaDemoFeed ??= {
  entries: [],
  guests: new Map(),
  events: new Map(),
  seenWebhookIds: new Set(),
  seq: 0,
  rejected: 0,
  duplicates: 0,
});

export const LumaFeedStore = {
  markSeen(webhookId: string) {
    if (state.seenWebhookIds.has(webhookId)) {
      state.duplicates += 1;
      return false;
    }
    state.seenWebhookIds.add(webhookId);
    return true;
  },
  markRejected() {
    state.rejected += 1;
  },
  saveGuest(event: LumaEvent, guest: LumaGuest, profile: Profile) {
    state.events.set(event.api_id, event);
    state.guests.set(guest.api_id, { event, guest, profile });
  },
  findGuest(guestApiId: string) {
    return state.guests.get(guestApiId);
  },
  randomGuest(random: number) {
    const guests = [...state.guests.values()].filter(({ guest }) => !guest.checked_in_at);
    return guests[Math.floor(random * guests.length)];
  },
  push(entry: Omit<LumaFeedEntry, 'seq'>) {
    state.seq += 1;
    state.entries.push({ ...entry, seq: state.seq });
    if (state.entries.length > MAX_ENTRIES) state.entries.shift();
  },
  read(afterSeq: number): LumaFeed {
    const guests = [...state.guests.values()];
    return {
      entries: state.entries.filter((entry) => entry.seq > afterSeq),
      lastSeq: state.seq,
      received: state.seenWebhookIds.size,
      rejected: state.rejected,
      duplicates: state.duplicates,
      events: [...state.events.values()].map((event) =>
        Object.assign({}, event, {
          guests: guests.filter((item) => item.event.api_id === event.api_id).length,
          checkedIn: guests.filter(
            (item) => item.event.api_id === event.api_id && item.guest.checked_in_at,
          ).length,
        }),
      ),
    };
  },
};
