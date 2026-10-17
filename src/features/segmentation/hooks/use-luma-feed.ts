import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { SegmentationService } from '../services/segmentation.service';
import { useSegmentationStore } from '../store/segmentation-store';

const POLL_MS = 1500;

export function useLumaFeed() {
  const addProfile = useSegmentationStore((state) => state.addProfile);
  const saveOutcome = useSegmentationStore((state) => state.saveOutcome);
  const cursor = useRef(0);

  const query = useQuery({
    queryKey: ['segmentation', 'luma-feed'],
    queryFn: () => SegmentationService.lumaFeed(cursor.current),
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!query.data) return;
    for (const entry of query.data.entries) {
      if (entry.seq <= cursor.current) continue;
      addProfile(entry.profile);
      saveOutcome(entry.outcome);
      cursor.current = entry.seq;
    }
  }, [query.data, addProfile, saveOutcome]);

  return query;
}
