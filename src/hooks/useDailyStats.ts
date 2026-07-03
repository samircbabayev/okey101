import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchDailyGameData } from '../services/gameService';
import type { GameData, PlayerDayStats } from '../types';
import { calculateDailyStats } from '../utils/statsCalculations';

interface UseDailyStatsResult {
  stats: PlayerDayStats[];
  gameCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDailyStats(date: string): UseDailyStatsResult {
  const [gamesData, setGamesData] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!date) {
      setGamesData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchDailyGameData(date);
      setGamesData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Statistika yüklənmədi');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const stats = useMemo(() => calculateDailyStats(gamesData), [gamesData]);

  return {
    stats,
    gameCount: gamesData.length,
    loading,
    error,
    refetch,
  };
}
