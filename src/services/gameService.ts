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
import { getRoundPenaltiesForPlayer } from '../utils/scoreCalculations';
import { supabase } from './supabaseClient';

function teamNumberFromName(name: string): number {
  const match = name.match(/^Komanda (\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

interface GameWithRounds extends Game {
  rounds: Pick<Round, 'is_finished'>[];
}

export async function fetchGames(): Promise<GameListItem[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*, rounds(is_finished)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as GameWithRounds[]).map((row) => {
    const { rounds, ...game } = row;
    const roundList = rounds ?? [];
    return {
      game: game as Game,
      finishedRoundCount: roundList.filter((r) => r.is_finished).length,
      hasActiveRound: roundList.some((r) => !r.is_finished),
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

  const { error: playersError } = await supabase
    .from('players')
    .insert(playerRows);

  if (playersError) throw playersError;

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

export async function finishGame(gameId: string): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({ status: GameStatus.Finished })
    .eq('id', gameId);

  if (error) throw error;
}
