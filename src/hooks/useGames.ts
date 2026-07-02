import { useCallback, useEffect, useState } from 'react';
import { fetchGames } from '../services/gameService';
import type { GameListItem } from '../types';

interface UseGamesResult {
  games: GameListItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGames(): UseGamesResult {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchGames();
      setGames(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Oyunlar yüklənmədi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { games, loading, error, refetch };
}
