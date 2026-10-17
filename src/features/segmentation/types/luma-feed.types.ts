import type { LumaEvent } from './luma.schema';
import type { Profile, SegmentationOutcome } from './segmentation.types';

export interface LumaFeedEntry {
  seq: number;
  webhookId: string;
  type: 'guest.registered' | 'guest.updated';
  receivedAt: string;
  profile: Profile;
  outcome: SegmentationOutcome;
}

export interface LumaFeed {
  entries: LumaFeedEntry[];
  lastSeq: number;
  received: number;
  rejected: number;
  duplicates: number;
  events: (LumaEvent & { guests: number; checkedIn: number })[];
}
