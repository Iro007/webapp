import { useEffect, useState } from 'react';

import { SegmentationService } from '../services/segmentation.service';

const EVERY_MS = 3000;

export function useLiveSignUps() {
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!live) return undefined;
    const send = () => {
      SegmentationService.simulateLuma('auto').catch(() => {
        setFailed(true);
        setLive(false);
      });
    };
    send();
    const timer = setInterval(send, EVERY_MS);
    return () => clearInterval(timer);
  }, [live]);

  return {
    live,
    failed,
    toggle: () => {
      setFailed(false);
      setLive((value) => !value);
    },
  };
}
