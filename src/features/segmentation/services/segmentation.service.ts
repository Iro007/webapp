import { createHttpClient } from '@/core/http';

import type { EvaluationMode, SegmentationEvaluation } from '../types/evaluation.types';
import type { LumaFeed } from '../types/luma-feed.types';
import type { Profile, SegmentationOutcome, Trigger } from '../types/segmentation.types';

const api = createHttpClient();

export const SegmentationService = {
  async segment(profile: Profile, trigger: Trigger) {
    const { data } = await api.post<SegmentationOutcome>('/api/segment', { profile, trigger });
    return data;
  },
  async simulateLuma(kind: 'registration' | 'check_in' | 'auto' = 'auto') {
    const { data } = await api.post<{ ok: boolean }>('/api/luma/simulate', { kind });
    return data;
  },
  async lumaFeed(afterSeq: number) {
    const { data } = await api.get<LumaFeed>('/api/luma/feed', { params: { after: afterSeq } });
    return data;
  },
  async evaluate(mode: EvaluationMode = 'single') {
    const { data } = await api.post<SegmentationEvaluation>('/api/segment/evaluate', { mode });
    return data;
  },
};
