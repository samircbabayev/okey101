import type {
  Game,
  Penalty,
  Player,
  PlayerTotals,
  Round,
  Score,
  Team,
  TeamTotals,
} from '../types';
import { GameStatus } from '../types';
import { az } from '../i18n/az';

export function calculatePlayerTotals(
  players: Player[],
  teams: Team[],
  scores: Score[],
  penalties: Penalty[],
  rounds: Round[],
): PlayerTotals[] {
  const teamById = new Map(teams.map((t) => [t.id, t]));
  const activeRoundIds = new Set(
    rounds.filter((r) => !r.is_finished).map((r) => r.id),
  );

  return players.map((player) => {
    const team = player.team_id ? teamById.get(player.team_id) : undefined;
    const pointsTotal = scores
      .filter((s) => s.player_id === player.id)
      .reduce((sum, s) => sum + s.points, 0);
    const penaltyFromFinishedRounds = scores
      .filter((s) => s.player_id === player.id)
      .reduce((sum, s) => sum + s.penalty_points, 0);
    const penaltyFromActiveRound = penalties
      .filter(
        (p) => p.player_id === player.id && activeRoundIds.has(p.round_id),
      )
      .reduce((sum, p) => sum + p.penalty_value, 0);
    const penaltyTotal = penaltyFromFinishedRounds + penaltyFromActiveRound;

    return {
      playerId: player.id,
      playerName: player.name,
      teamId: player.team_id ?? '',
      teamName: team?.name ?? az.scoreboard.unknownTeam,
      pointsTotal,
      penaltyTotal,
      grandTotal: pointsTotal + penaltyTotal,
    };
  });
}

export function calculateTeamTotals(playerTotals: PlayerTotals[]): TeamTotals[] {
  const byTeam = new Map<string, TeamTotals>();

  for (const pt of playerTotals) {
    if (!pt.teamId) continue;
    const existing = byTeam.get(pt.teamId);
    if (existing) {
      existing.grandTotal += pt.grandTotal;
    } else {
      byTeam.set(pt.teamId, {
        teamId: pt.teamId,
        teamName: pt.teamName,
        grandTotal: pt.grandTotal,
      });
    }
  }

  return Array.from(byTeam.values()).sort((a, b) =>
    a.teamName.localeCompare(b.teamName),
  );
}

export function getWinningTeam(teamTotals: TeamTotals[]): TeamTotals | null {
  if (teamTotals.length === 0) return null;
  const lowestScore = Math.min(...teamTotals.map((t) => t.grandTotal));
  const lowestTeams = teamTotals.filter((t) => t.grandTotal === lowestScore);
  return lowestTeams.length === 1 ? lowestTeams[0] : null;
}

export function isTiedGame(
  game: Pick<Game, 'status' | 'winner_team_id'>,
  teamTotals: TeamTotals[],
): boolean {
  if (game.status !== GameStatus.Finished) return false;
  if (game.winner_team_id) return false;
  if (teamTotals.length < 2) return false;
  return getWinningTeam(teamTotals) === null;
}

export function resolveWinningTeam(
  game: Pick<Game, 'status' | 'winner_team_id'>,
  teamTotals: TeamTotals[],
): TeamTotals | null {
  if (game.status !== GameStatus.Finished) return null;
  if (game.winner_team_id) {
    return (
      teamTotals.find((t) => t.teamId === game.winner_team_id) ??
      getWinningTeam(teamTotals)
    );
  }
  return getWinningTeam(teamTotals);
}

export function getActiveRound(rounds: Round[]): Round | undefined {
  return rounds.find((r) => !r.is_finished);
}

export function getCurrentRoundNumber(rounds: Round[]): number {
  const active = getActiveRound(rounds);
  if (active) return active.round_number;
  if (rounds.length === 0) return 0;
  return Math.max(...rounds.map((r) => r.round_number));
}

export function canStartRound(game: Game, rounds: Round[]): boolean {
  if (game.status === GameStatus.Finished) return false;
  if (rounds.some((r) => !r.is_finished)) return false;
  return rounds.length < game.total_rounds;
}

export function getRoundPenaltiesForPlayer(
  penalties: Penalty[],
  roundId: string,
  playerId: string,
): number {
  return penalties
    .filter((p) => p.round_id === roundId && p.player_id === playerId)
    .reduce((sum, p) => sum + p.penalty_value, 0);
}

export function isValidIntegerInput(value: string): boolean {
  if (value === '' || value === '-') return true;
  return /^-?\d+$/.test(value);
}

export function parseIntegerInput(value: string): number | null {
  if (value === '' || value === '-') return null;
  if (!/^-?\d+$/.test(value)) return null;
  return parseInt(value, 10);
}

export function isPositiveInteger(value: string): boolean {
  return /^\d+$/.test(value) && parseInt(value, 10) > 0;
}
