const FIRST_NAMES = [
  'Alex',
  'Sam',
  'Jordan',
  'Taylor',
  'Robin',
  'Casey',
  'Morgan',
  'Riley',
  'Dana',
  'Quinn',
  'Avery',
  'Noa',
];

const LAST_NAMES = [
  'Demo',
  'Sample',
  'Placeholder',
  'Testwell',
  'Example',
  'Mockley',
  'Fakeson',
  'Prueba',
];

export const SIMULATED_EVENTS = [
  {
    api_id: 'evt-sim-founders',
    name: 'AI for Founders Meetup',
    start_at: '2026-10-17T23:00:00.000Z',
  },
  { api_id: 'evt-sim-operations', name: 'AI in Operations', start_at: '2026-10-22T23:00:00.000Z' },
  { api_id: 'evt-sim-llm', name: 'Building with LLM APIs', start_at: '2026-10-29T23:00:00.000Z' },
];

export function fictionalPerson(seed: number) {
  const first = FIRST_NAMES[seed % FIRST_NAMES.length] ?? 'Alex';
  const last = LAST_NAMES[(seed * 7) % LAST_NAMES.length] ?? 'Demo';
  return {
    name: `${first} ${last}`,
    email: `${first}.${last}.${seed}@example.com`.toLowerCase(),
  };
}
