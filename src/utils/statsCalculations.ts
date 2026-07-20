import type { GameData, PlayerDayStats } from '../types';
import { GameStatus, PenaltyReason } from '../types';
import {
  calculatePlayerTotals,
  calculateTeamTotals,
  resolveWinningTeam,
} from './scoreCalculations';

function emptyReasonRecord(): Record<PenaltyReason, number> {
  return {
    [PenaltyReason.FalseDiscard]: 0,
    [PenaltyReason.FalseOpen]: 0,
    [PenaltyReason.GiveTile]: 0,
    [PenaltyReason.JokerDiscard]: 0,
    [PenaltyReason.Other]: 0,
  };
}

type MutableStats = PlayerDayStats;

function createStats(name: string): MutableStats {
  return {
    name,
    gamesPlayed: 0,
    finishedGames: 0,
    wins: 0,
    winRate: 0,
    pointsTotal: 0,
    penaltyTotal: 0,
    grandTotal: 0,
    avgScore: 0,
    penaltyCount: 0,
    penaltyByReason: emptyReasonRecord(),
    maxSinglePenalty: 0,
    score202Count: 0,
    cleanRounds: 0,
    roundsPlayed: 0,
    timesStartedFirst: 0,
    bestGame: null,
    worstGame: null,
  };
}

export function calculateDailyStats(gamesData: GameData[]): PlayerDayStats[] {
  const byName = new Map<string, MutableStats>();

  const getStats = (name: string): MutableStats => {
    let stats = byName.get(name);
    if (!stats) {
      stats = createStats(name);
      byName.set(name, stats);
    }
    return stats;
  };

  for (const { game, teams, players, rounds, scores, penalties } of gamesData) {
    const playerById = new Map(players.map((p) => [p.id, p]));
    const playerTotals = calculatePlayerTotals(
      players,
      teams,
      scores,
      penalties,
      rounds,
    );
    const teamTotals = calculateTeamTotals(playerTotals);
    const isFinished = game.status === GameStatus.Finished;
    const winner = resolveWinningTeam(game, teamTotals);

    for (const pt of playerTotals) {
      const stats = getStats(pt.playerName);
      stats.gamesPlayed += 1;
      stats.pointsTotal += pt.pointsTotal;
      stats.penaltyTotal += pt.penaltyTotal;
      stats.grandTotal += pt.grandTotal;

      stats.bestGame =
        stats.bestGame === null
          ? pt.grandTotal
          : Math.min(stats.bestGame, pt.grandTotal);
      stats.worstGame =
        stats.worstGame === null
          ? pt.grandTotal
          : Math.max(stats.worstGame, pt.grandTotal);

      if (isFinished) {
        stats.finishedGames += 1;
        if (winner && pt.teamId === winner.teamId) {
          stats.wins += 1;
        }
      }
    }

    for (const score of scores) {
      const player = playerById.get(score.player_id);
      if (!player) continue;
      const stats = getStats(player.name);
      stats.roundsPlayed += 1;
      if (score.points === 202) {
        stats.score202Count += 1;
      }
      if (score.penalty_points === 0) {
        stats.cleanRounds += 1;
      }
    }

    for (const round of rounds) {
      if (!round.started_by_player_id) continue;
      const player = playerById.get(round.started_by_player_id);
      if (!player) continue;
      getStats(player.name).timesStartedFirst += 1;
    }

    for (const penalty of penalties) {
      const player = playerById.get(penalty.player_id);
      if (!player) continue;
      const stats = getStats(player.name);
      stats.penaltyCount += 1;
      stats.penaltyByReason[penalty.reason] += 1;
      stats.maxSinglePenalty = Math.max(
        stats.maxSinglePenalty,
        penalty.penalty_value,
      );
    }
  }

  const result = Array.from(byName.values());

  for (const stats of result) {
    stats.avgScore =
      stats.gamesPlayed > 0
        ? Math.round((stats.grandTotal / stats.gamesPlayed) * 10) / 10
        : 0;
    stats.winRate =
      stats.finishedGames > 0
        ? Math.round((stats.wins / stats.finishedGames) * 100)
        : 0;
  }

  return sortByWins(result);
}

export function sortByWins(stats: PlayerDayStats[]): PlayerDayStats[] {
  return [...stats].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.avgScore !== b.avgScore) return a.avgScore - b.avgScore;
    return a.name.localeCompare(b.name);
  });
}

export function getDayChampion(stats: PlayerDayStats[]): PlayerDayStats | null {
  const withWins = stats.filter((s) => s.finishedGames > 0);
  if (withWins.length === 0) return null;
  const champion = sortByWins(withWins)[0];
  return champion.wins > 0 ? champion : null;
}

export function getTopPenaltyPlayer(
  stats: PlayerDayStats[],
): PlayerDayStats | null {
  const withPenalties = stats.filter((s) => s.penaltyCount > 0);
  if (withPenalties.length === 0) return null;
  return withPenalties.reduce((max, s) =>
    s.penaltyCount > max.penaltyCount ? s : max,
  );
}

export function lossCount(stats: PlayerDayStats): number {
  return stats.finishedGames - stats.wins;
}

export function getBiggestLoser(stats: PlayerDayStats[]): PlayerDayStats | null {
  const withLosses = stats.filter(
    (s) => s.finishedGames > 0 && lossCount(s) > 0,
  );
  if (withLosses.length === 0) return null;
  return [...withLosses].sort((a, b) => {
    if (lossCount(b) !== lossCount(a)) return lossCount(b) - lossCount(a);
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
    return a.name.localeCompare(b.name);
  })[0];
}

export function getWinlessPlayers(stats: PlayerDayStats[]): PlayerDayStats[] {
  return stats
    .filter((s) => s.finishedGames > 0 && s.wins === 0)
    .sort((a, b) => b.finishedGames - a.finishedGames);
}

export function getDisasterGame(stats: PlayerDayStats[]): PlayerDayStats | null {
  const played = stats.filter((s) => s.worstGame !== null);
  if (played.length === 0) return null;
  return played.reduce((max, s) =>
    (s.worstGame ?? 0) > (max.worstGame ?? 0) ? s : max,
  );
}

export function getMistakeMachine(
  stats: PlayerDayStats[],
): PlayerDayStats | null {
  const withPenalties = stats.filter(
    (s) => s.penaltyCount > 0 && s.gamesPlayed > 0,
  );
  if (withPenalties.length === 0) return null;
  return withPenalties.reduce((max, s) =>
    s.penaltyCount / s.gamesPlayed > max.penaltyCount / max.gamesPlayed
      ? s
      : max,
  );
}

export function getBiggestDebtor(
  stats: PlayerDayStats[],
): PlayerDayStats | null {
  const withDebt = stats.filter((s) => s.penaltyTotal > 0);
  if (withDebt.length === 0) return null;
  return withDebt.reduce((max, s) =>
    s.penaltyTotal > max.penaltyTotal ? s : max,
  );
}

export function getBiggestSinglePenalty(
  stats: PlayerDayStats[],
): PlayerDayStats | null {
  const withHits = stats.filter((s) => s.maxSinglePenalty > 0);
  if (withHits.length === 0) return null;
  return withHits.reduce((max, s) =>
    s.maxSinglePenalty > max.maxSinglePenalty ? s : max,
  );
}

export function get202Master(stats: PlayerDayStats[]): PlayerDayStats | null {
  const with202 = stats.filter((s) => s.score202Count > 0);
  if (with202.length === 0) return null;
  return [...with202].sort((a, b) => {
    if (b.score202Count !== a.score202Count) {
      return b.score202Count - a.score202Count;
    }
    return a.name.localeCompare(b.name);
  })[0];
}

export function getCleanPlayer(stats: PlayerDayStats[]): PlayerDayStats | null {
  const withClean = stats.filter((s) => s.cleanRounds > 0);
  if (withClean.length === 0) return null;
  return [...withClean].sort((a, b) => {
    if (b.cleanRounds !== a.cleanRounds) return b.cleanRounds - a.cleanRounds;
    if (a.penaltyCount !== b.penaltyCount) return a.penaltyCount - b.penaltyCount;
    return a.name.localeCompare(b.name);
  })[0];
}

export interface ReasonSpecialist {
  reason: PenaltyReason;
  name: string;
  count: number;
}

export function getReasonSpecialists(
  stats: PlayerDayStats[],
): ReasonSpecialist[] {
  const reasons = [
    PenaltyReason.FalseDiscard,
    PenaltyReason.FalseOpen,
    PenaltyReason.GiveTile,
    PenaltyReason.JokerDiscard,
    PenaltyReason.Other,
  ];

  const result: ReasonSpecialist[] = [];
  for (const reason of reasons) {
    let top: ReasonSpecialist | null = null;
    for (const s of stats) {
      const count = s.penaltyByReason[reason];
      if (count > 0 && (!top || count > top.count)) {
        top = { reason, name: s.name, count };
      }
    }
    if (top) result.push(top);
  }
  return result;
}
