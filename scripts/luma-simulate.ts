import { createHmac, randomUUID } from 'node:crypto';

const args = process.argv.slice(2);
const option = (name: string, fallback: string) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? (args[index + 1] ?? fallback) : fallback;
};
const flag = (name: string) => args.includes(`--${name}`);

const BASE = option('base', process.env.EVAL_BASE_URL ?? 'http://localhost:3000');
const COUNT = Number(option('count', '10'));
const EVERY_MS = Number(option('every', '2')) * 1000;
const KIND = option('kind', 'auto');
const SECRET = process.env.LUMA_WEBHOOK_SECRET || 'whsec_demo_simulated_luma';

function sign(rawBody: string, secret: string) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return {
    'webhook-id': `msg_${randomUUID().replaceAll('-', '')}`,
    'webhook-timestamp': timestamp,
    'webhook-signature': `t=${timestamp},v1=${signature}`,
  };
}

async function deliver(rawBody: string, headers: Record<string, string>) {
  const res = await fetch(`${BASE}/api/luma/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: rawBody,
  });
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

function describe(body: Record<string, unknown>) {
  const entry = body.entry as
    | {
        type: string;
        profile: { alias: string; role: string; company: string };
        outcome: { segment: { value: string }; light: string; meta: { latencyMs: number } };
      }
    | undefined;
  if (body.duplicate) return 'duplicate ignored (same webhook-id)';
  if (!entry) return body.ok ? 'accepted, nothing to re-decide' : String(body.error);
  const { profile, outcome } = entry;
  return `${entry.type} · ${profile.alias} · ${profile.role} at ${profile.company} → ${outcome.segment.value} · ${outcome.light} (${outcome.meta.latencyMs} ms)`;
}

async function sendOne(index: number) {
  const preview = await fetch(`${BASE}/api/luma/simulate?kind=${KIND}`);
  if (!preview.ok) throw new Error(`Could not build a payload: ${preview.status}`);
  const rawBody = JSON.stringify(await preview.json());
  const headers = sign(rawBody, SECRET);

  const result = await deliver(rawBody, headers);
  console.log(`#${index + 1} ${result.status} ${describe(result.body)}`);

  if (flag('replay')) {
    const replay = await deliver(rawBody, headers);
    console.log(`   replay ${replay.status} ${describe(replay.body)}`);
  }
  if (flag('tamper')) {
    const forged = await deliver(rawBody, sign(rawBody, 'whsec_wrong_secret'));
    console.log(`   forged ${forged.status} ${describe(forged.body)}`);
  }
}

console.log(
  `Sending ${COUNT} signed Luma webhooks to ${BASE}/api/luma/webhook every ${EVERY_MS / 1000}s (kind: ${KIND})\n`,
);
for (let index = 0; index < COUNT; index += 1) {
  // oxlint-disable-next-line no-await-in-loop -- deliveries are paced like a real webhook stream
  await sendOne(index).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
  // oxlint-disable-next-line no-await-in-loop -- wait between deliveries
  if (index < COUNT - 1) await new Promise((resolve) => setTimeout(resolve, EVERY_MS));
}
