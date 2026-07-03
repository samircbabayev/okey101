import type {
  CreateGameInput,
  CreatePenaltyInput,
  Game,
  GameData,
  GameListItem,
  Penalty,
  Player,
  PlayerScoreInput,
  Round,
  Score,
  Team,
} from '../types';
import { GameStatus } from '../types';
import { az } from '../i18n/az';
import {
  calculatePlayerTotals,
  calculateTeamTotals,
  getRoundPenaltiesForPlayer,
  isTiedGame,
  resolveWinningTeam,
} from '../utils/scoreCalculations';
import { supabase } from './supabaseClient';

function teamNumberFromName(name: string): number {
  const match = name.match(/^Komanda (\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

function todayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function getNextGameNameForToday(): Promise<string> {
  const { start, end } = todayRange();
  const { count, error } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());

  if (error) throw error;

  return az.createGame.gameNumber((count ?? 0) + 1);
}

interface GameWithRounds extends Game {
  rounds: Pick<Round, 'id' | 'is_finished'>[];
}

interface WinnerInfo {
  teamName: string | null;
  playerNames: string[];
  isDraw: boolean;
}

export async function fetchGames(): Promise<GameListItem[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*, rounds(id, is_finished)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as GameWithRounds[];
  const winnerByGameId = await computeWinners(rows);

  return rows.map((row) => {
    const { rounds, ...game } = row;
    const roundList = rounds ?? [];
    const winner = winnerByGameId.get(row.id);
    return {
      game: game as Game,
      finishedRoundCount: roundList.filter((r) => r.is_finished).length,
      hasActiveRound: roundList.some((r) => !r.is_finished),
      winnerTeamName: winner?.teamName ?? null,
      winnerPlayerNames: winner?.playerNames ?? [],
      isDraw: winner?.isDraw ?? false,
    };
  });
}

async function computeWinners(
  rows: GameWithRounds[],
): Promise<Map<string, WinnerInfo>> {
  const winnerByGameId = new Map<string, WinnerInfo>();
  const finishedRows = rows.filter((r) => r.status === GameStatus.Finished);
  if (finishedRows.length === 0) return winnerByGameId;

  const finishedGameIds = finishedRows.map((r) => r.id);
  const finishedRoundIds = finishedRows.flatMap((r) =>
    (r.rounds ?? []).map((rd) => rd.id),
  );

  const [teamsRes, playersRes] = await Promise.all([
    supabase.from('teams').select('*').in('game_id', finishedGameIds),
    supabase.from('players').select('*').in('game_id', finishedGameIds),
  ]);

  if (teamsRes.error) throw teamsRes.error;
  if (playersRes.error) throw playersRes.error;

  let scores: Score[] = [];
  let penalties: Penalty[] = [];

  if (finishedRoundIds.length > 0) {
    const [scoresRes, penaltiesRes] = await Promise.all([
      supabase.from('scores').select('*').in('round_id', finishedRoundIds),
      supabase.from('penalties').select('*').in('round_id', finishedRoundIds),
    ]);

    if (scoresRes.error) throw scoresRes.error;
    if (penaltiesRes.error) throw penaltiesRes.error;

    scores = (scoresRes.data ?? []) as Score[];
    penalties = (penaltiesRes.data ?? []) as Penalty[];
  }

  const allTeams = (teamsRes.data ?? []) as Team[];
  const allPlayers = (playersRes.data ?? []) as Player[];

  for (const row of finishedRows) {
    const gameTeams = allTeams.filter((t) => t.game_id === row.id);
    const gamePlayers = allPlayers.filter((p) => p.game_id === row.id);
    const roundIds = new Set((row.rounds ?? []).map((rd) => rd.id));
    const gameScores = scores.filter((s) => roundIds.has(s.round_id));
    const gamePenalties = penalties.filter((p) => roundIds.has(p.round_id));
    const gameRounds: Round[] = (row.rounds ?? []).map((rd) => ({
      id: rd.id,
      game_id: row.id,
      round_number: 0,
      started_by_player_id: null,
      is_finished: rd.is_finished,
      created_at: '',
    }));

    const playerTotals = calculatePlayerTotals(
      gamePlayers,
      gameTeams,
      gameScores,
      gamePenalties,
      gameRounds,
    );
    const teamTotals = calculateTeamTotals(playerTotals);
    const winner = resolveWinningTeam(row, teamTotals);

    if (winner) {
      winnerByGameId.set(row.id, {
        teamName: winner.teamName,
        playerNames: playerTotals
          .filter((pt) => pt.teamId === winner.teamId)
          .map((pt) => pt.playerName)
          .sort((a, b) => a.localeCompare(b)),
        isDraw: false,
      });
    } else if (isTiedGame(row, teamTotals)) {
      winnerByGameId.set(row.id, {
        teamName: null,
        playerNames: [],
        isDraw: true,
      });
    }
  }

  return winnerByGameId;
}

export async function fetchDailyGameData(date: string): Promise<GameData[]> {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .order('created_at', { ascending: true });

  if (gamesError) throw gamesError;

  const gameList = (games ?? []) as Game[];
  if (gameList.length === 0) return [];

  const gameIds = gameList.map((g) => g.id);

  const [teamsRes, playersRes, roundsRes] = await Promise.all([
    supabase.from('teams').select('*').in('game_id', gameIds),
    supabase.from('players').select('*').in('game_id', gameIds),
    supabase.from('rounds').select('*').in('game_id', gameIds),
  ]);

  if (teamsRes.error) throw teamsRes.error;
  if (playersRes.error) throw playersRes.error;
  if (roundsRes.error) throw roundsRes.error;

  const teams = (teamsRes.data ?? []) as Team[];
  const players = (playersRes.data ?? []) as Player[];
  const rounds = (roundsRes.data ?? []) as Round[];
  const roundIds = rounds.map((r) => r.id);

  let scores: Score[] = [];
  let penalties: Penalty[] = [];

  if (roundIds.length > 0) {
    const [scoresRes, penaltiesRes] = await Promise.all([
      supabase.from('scores').select('*').in('round_id', roundIds),
      supabase.from('penalties').select('*').in('round_id', roundIds),
    ]);

    if (scoresRes.error) throw scoresRes.error;
    if (penaltiesRes.error) throw penaltiesRes.error;

    scores = (scoresRes.data ?? []) as Score[];
    penalties = (penaltiesRes.data ?? []) as Penalty[];
  }

  return gameList.map((game) => {
    const gameRoundIds = new Set(
      rounds.filter((r) => r.game_id === game.id).map((r) => r.id),
    );
    return {
      game,
      teams: teams.filter((t) => t.game_id === game.id),
      players: players.filter((p) => p.game_id === game.id),
      rounds: rounds.filter((r) => r.game_id === game.id),
      scores: scores.filter((s) => gameRoundIds.has(s.round_id)),
      penalties: penalties.filter((p) => gameRoundIds.has(p.round_id)),
    };
  });
}

export async function createGame(input: CreateGameInput): Promise<string> {
  const { data: game, error: gameError } = await supabase
    .from('games')
    .insert({
      name: input.name,
      team_count: input.teamCount,
      total_rounds: input.totalRounds,
      status: GameStatus.Active,
    })
    .select('id')
    .single();

  if (gameError) throw gameError;
  if (!game) throw new Error('Failed to create game');

  const gameId = game.id as string;

  const teamRows = Array.from({ length: input.teamCount }, (_, i) => ({
    game_id: gameId,
    name: `Komanda ${i + 1}`,
  }));

  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .insert(teamRows)
    .select('id, name');

  if (teamsError) throw teamsError;
  if (!teams) throw new Error('Failed to create teams');

  const teamIdByNumber = new Map(
    teams.map((t) => [teamNumberFromName(t.name as string), t.id as string]),
  );

  const playerRows = input.players.map((p) => ({
    game_id: gameId,
    team_id: teamIdByNumber.get(p.teamNumber) ?? null,
    name: p.name,
    turn_order: p.turnOrder,
  }));

  const { data: insertedPlayers, error: playersError } = await supabase
    .from('players')
    .insert(playerRows)
    .select('id, turn_order');

  if (playersError) throw playersError;

  const sortedPlayers = [...(insertedPlayers ?? [])].sort(
    (a, b) => (a.turn_order as number) - (b.turn_order as number),
  );
  const firstStarter = sortedPlayers[0];

  if (firstStarter) {
    const { error: roundError } = await supabase.from('rounds').insert({
      game_id: gameId,
      round_number: 1,
      started_by_player_id: firstStarter.id,
      is_finished: false,
    });

    if (roundError) throw roundError;
  }

  return gameId;
}

export async function fetchGameData(gameId: string): Promise<GameData> {
  const [gameRes, teamsRes, playersRes, roundsRes] = await Promise.all([
    supabase.from('games').select('*').eq('id', gameId).single(),
    supabase.from('teams').select('*').eq('game_id', gameId).order('name'),
    supabase.from('players').select('*').eq('game_id', gameId).order('turn_order'),
    supabase.from('rounds').select('*').eq('game_id', gameId).order('round_number'),
  ]);

  if (gameRes.error) throw gameRes.error;
  if (teamsRes.error) throw teamsRes.error;
  if (playersRes.error) throw playersRes.error;
  if (roundsRes.error) throw roundsRes.error;

  const roundIds = (roundsRes.data ?? []).map((r) => r.id as string);

  let scores: Score[] = [];
  let penalties: Penalty[] = [];

  if (roundIds.length > 0) {
    const [scoresRes, penaltiesRes] = await Promise.all([
      supabase.from('scores').select('*').in('round_id', roundIds),
      supabase.from('penalties').select('*').in('round_id', roundIds),
    ]);

    if (scoresRes.error) throw scoresRes.error;
    if (penaltiesRes.error) throw penaltiesRes.error;

    scores = (scoresRes.data ?? []) as Score[];
    penalties = (penaltiesRes.data ?? []) as Penalty[];
  }

  return {
    game: gameRes.data as Game,
    teams: (teamsRes.data ?? []) as Team[],
    players: (playersRes.data ?? []) as Player[],
    rounds: (roundsRes.data ?? []) as Round[],
    scores,
    penalties,
  };
}

export async function startRound(
  game: Game,
  players: Player[],
  rounds: Round[],
): Promise<Round> {
  const nextRoundNumber = rounds.length + 1;

  if (nextRoundNumber > game.total_rounds) {
    throw new Error('All rounds have already been played');
  }

  const activeRound = rounds.find((r) => !r.is_finished);
  if (activeRound) {
    throw new Error('Finish the current round before starting a new one');
  }

  const sortedPlayers = [...players].sort((a, b) => a.turn_order - b.turn_order);
  const starterIndex = (nextRoundNumber - 1) % sortedPlayers.length;
  const startingPlayer = sortedPlayers[starterIndex];

  const { data: round, error: roundError } = await supabase
    .from('rounds')
    .insert({
      game_id: game.id,
      round_number: nextRoundNumber,
      started_by_player_id: startingPlayer.id,
      is_finished: false,
    })
    .select('*')
    .single();

  if (roundError) throw roundError;
  if (!round) throw new Error('Failed to start round');

  return round as Round;
}

export async function createPenalty(input: CreatePenaltyInput): Promise<Penalty> {
  const { data, error } = await supabase
    .from('penalties')
    .insert({
      round_id: input.roundId,
      player_id: input.playerId,
      penalty_value: input.penaltyValue,
      reason: input.reason,
      note: input.note ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create penalty');

  return data as Penalty;
}

export async function finishRound(
  round: Round,
  game: Game,
  playerScores: PlayerScoreInput[],
  penalties: Penalty[],
): Promise<void> {
  const scoreRows = playerScores.map((ps) => ({
    round_id: round.id,
    player_id: ps.playerId,
    points: ps.points,
    penalty_points: getRoundPenaltiesForPlayer(penalties, round.id, ps.playerId),
  }));

  const { error: scoresError } = await supabase.from('scores').insert(scoreRows);
  if (scoresError) throw scoresError;

  const { error: roundError } = await supabase
    .from('rounds')
    .update({ is_finished: true })
    .eq('id', round.id);

  if (roundError) throw roundError;

  if (round.round_number >= game.total_rounds) {
    const { error: gameError } = await supabase
      .from('games')
      .update({ status: GameStatus.Finished })
      .eq('id', game.id);

    if (gameError) throw gameError;
  }
}

export async function finishGame(
  gameId: string,
  winnerTeamId: string | null = null,
): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({ status: GameStatus.Finished, winner_team_id: winnerTeamId })
    .eq('id', gameId);

  if (error) throw error;
}
