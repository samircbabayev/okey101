import type { CreateGameInput } from '../types';

const STORAGE_KEY = 'okey101:last-created-game';

export interface LastGameCache {
  teamCount: number;
  totalRounds: number;
  players: CreateGameInput['players'];
}

export function saveLastGameCache(input: CreateGameInput): void {
  const cache: LastGameCache = {
    teamCount: input.teamCount,
    totalRounds: input.totalRounds,
    players: input.players,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function loadLastGameCache(): LastGameCache | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LastGameCache;
    if (
      typeof parsed.teamCount !== 'number' ||
      typeof parsed.totalRounds !== 'number' ||
      !Array.isArray(parsed.players) ||
      parsed.players.length < 2
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function hasLastGameCache(): boolean {
  return loadLastGameCache() !== null;
}
