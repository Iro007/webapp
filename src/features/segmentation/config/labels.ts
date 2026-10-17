import type {
  Level,
  RecommendationKind,
  SegmentKey,
  StageKey,
  TrafficLight,
  Trigger,
} from '../types/segmentation.types';

export const SEGMENT_LABELS: Record<SegmentKey, string> = {
  founder: 'Founder / CEO',
  team_lead: 'Team lead',
  individual_contributor: 'Individual contributor',
  student: 'Student / early career',
  investor: 'Investor',
  other: 'Other',
};

export const STAGE_LABELS: Record<StageKey, string> = {
  idea: 'Idea',
  early_stage: 'Early stage',
  scale_up: 'Scale-up',
  corporate: 'Corporate',
  other: 'Other',
};

export const MATURITY_LABELS: Record<Level, string> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

export const URGENCY_LABELS: Record<Level, string> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

export const LIGHT_LABELS: Record<TrafficLight, string> = {
  green: 'Green · seller',
  yellow: 'Yellow · nurture',
  red: 'Red · person reviews',
};

export const RECOMMENDATION_LABELS: Record<RecommendationKind, string> = {
  sales_conversation: 'Seller today',
  program: 'Program sequence',
  event: 'Event invite',
  content: 'Content sequence',
  human_review: 'Human review',
};

export const TRIGGER_LABELS: Record<Trigger, string> = {
  sign_up: 'signed up on Luma',
  manual_edit: 'profile edited',
  attended_event: 'checked in at an event',
  role_change: 'changed role',
  funding_round: 'company raised a round',
  re_run: 're-run',
};
