import { NO_ACTIVITY } from '../mocks/profiles.mock';
import type { LumaEvent, LumaGuest } from '../types/luma.schema';
import { COMPANY_SIZES } from '../types/profile.schema';
import type { Profile } from '../types/segmentation.types';

export const LUMA_QUESTIONS = {
  role: 'Role',
  company: 'Company',
  industry: 'Industry',
  companySize: 'Company size',
  country: 'Country',
  goal: 'What do you want from this event?',
} as const;

function sizeOf(answer: string | undefined): Profile['companySize'] {
  return COMPANY_SIZES.find((size) => size === answer) ?? '2-10';
}

export function profileIdForGuest(guestApiId: string) {
  return `luma-${guestApiId}`;
}

export function profileFromLuma(event: LumaEvent, guest: LumaGuest): Profile {
  const answers = new Map(
    guest.registration_answers.map(({ label, answer }) => [label, answer.trim()]),
  );
  const read = (label: string, fallback: string) => answers.get(label) || fallback;

  return {
    id: profileIdForGuest(guest.api_id),
    alias: `Guest ${guest.api_id.slice(-4).toUpperCase()}`,
    role: read(LUMA_QUESTIONS.role, 'Unknown role'),
    company: read(LUMA_QUESTIONS.company, 'Unknown company'),
    industry: read(LUMA_QUESTIONS.industry, 'Unknown'),
    companySize: sizeOf(answers.get(LUMA_QUESTIONS.companySize)),
    country: read(LUMA_QUESTIONS.country, 'Unknown'),
    event: event.name,
    signupAnswer: read(LUMA_QUESTIONS.goal, 'No answer given'),
    signals: NO_ACTIVITY,
  };
}

export function registrationAnswers(profile: Omit<Profile, 'id' | 'alias' | 'signals'>) {
  return [
    { label: LUMA_QUESTIONS.role, question_type: 'text', answer: profile.role },
    { label: LUMA_QUESTIONS.company, question_type: 'company', answer: profile.company },
    { label: LUMA_QUESTIONS.industry, question_type: 'text', answer: profile.industry },
    { label: LUMA_QUESTIONS.companySize, question_type: 'dropdown', answer: profile.companySize },
    { label: LUMA_QUESTIONS.country, question_type: 'text', answer: profile.country },
    { label: LUMA_QUESTIONS.goal, question_type: 'long-text', answer: profile.signupAnswer },
  ];
}
