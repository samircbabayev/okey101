import { useCallback, useEffect, useState } from 'react';
import { fetchGameData } from '../services/gameService';
import type { GameData } from '../types';

interface UseGameDataResult {
  data: GameData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGameData(gameId: string | undefined): UseGameDataResult {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchGameData(gameId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Oyun yüklənmədi');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
