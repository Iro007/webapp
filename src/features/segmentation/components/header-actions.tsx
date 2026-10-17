'use client';

import { Button } from '@/ui';

import { useLiveSignUps } from '../hooks/use-live-sign-ups';
import { useLumaFeed } from '../hooks/use-luma-feed';
import { useRunAll } from '../hooks/use-run-all';

export function HeaderActions() {
  const { runAll, running, failed } = useRunAll();
  const signUps = useLiveSignUps();
  const feed = useLumaFeed();

  return (
    <div className="flex flex-col gap-2 tablet:items-end">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={signUps.toggle}>
          {signUps.live ? 'Pause Luma sign-ups' : 'Start Luma sign-ups'}
        </Button>
        <Button onClick={runAll} disabled={running}>
          {running ? 'Running Jev…' : 'Run Jev on all'}
        </Button>
      </div>
      <p aria-live="polite" className="text-caption text-fg-muted tabular-nums">
        {signUps.live ? 'Live · ' : ''}
        Luma webhook: {feed.data?.received ?? 0} received · {feed.data?.rejected ?? 0} rejected ·
        signatures verified
      </p>
      {failed || signUps.failed || feed.isError ? (
        <p role="alert" className="text-caption text-danger">
          Some calls failed. Check the Jev provider settings in .env.local.
        </p>
      ) : null}
    </div>
  );
}
