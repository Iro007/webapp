import { create } from 'zustand';

import { PROFILES_MOCK } from '../mocks/profiles.mock';
import type { Profile, ReviewVerdict, SegmentationOutcome } from '../types/segmentation.types';

interface SegmentationState {
  profiles: Profile[];
  history: Record<string, SegmentationOutcome[]>;
  reviews: Record<string, ReviewVerdict>;
  pendingIds: string[];
  addProfile: (profile: Profile) => void;
  updateProfile: (profile: Profile) => void;
  setPending: (id: string, pending: boolean) => void;
  saveOutcome: (outcome: SegmentationOutcome) => void;
  review: (id: string, verdict: ReviewVerdict) => void;
}

export const useSegmentationStore = create<SegmentationState>()((set) => ({
  profiles: PROFILES_MOCK,
  history: {},
  reviews: {},
  pendingIds: [],
  addProfile: (profile) =>
    set((state) =>
      state.profiles.some((item) => item.id === profile.id)
        ? { profiles: state.profiles.map((item) => (item.id === profile.id ? profile : item)) }
        : { profiles: [profile, ...state.profiles] },
    ),
  updateProfile: (profile) =>
    set((state) => ({
      profiles: state.profiles.map((item) => (item.id === profile.id ? profile : item)),
    })),
  setPending: (id, pending) =>
    set((state) => ({
      pendingIds: pending
        ? [...state.pendingIds, id]
        : state.pendingIds.filter((pendingId) => pendingId !== id),
    })),
  saveOutcome: (outcome) =>
    set((state) => {
      const { [outcome.profileId]: _review, ...reviews } = state.reviews;
      return {
        history: {
          ...state.history,
          [outcome.profileId]: [...(state.history[outcome.profileId] ?? []), outcome],
        },
        reviews,
      };
    }),
  review: (id, verdict) => set((state) => ({ reviews: { ...state.reviews, [id]: verdict } })),
}));

export function latestOutcome(history: SegmentationOutcome[] | undefined) {
  return history?.at(-1);
}
